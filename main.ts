import { readdirSync, readFileSync, mkdir, existsSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { abi } from 'thor-devkit';


const baseDir = resolve(__dirname, 'ABIs')
const distDir = resolve(__dirname, 'dist')
const entries = readdirSync(baseDir, { withFileTypes: true })

entries.forEach(v => {
    if (!v.isFile() || v.name.startsWith('.')) {
        return
    }
    const str = readFileSync(resolve(baseDir, v.name), { encoding: 'utf8' })
    const abiJSONArray = JSON.parse(str)
    if (!Array.isArray(abiJSONArray)) {
        throw new Error('ABI expected array')
    }
    mkdir(distDir, () => { })
    abiJSONArray.forEach(abiJSON => save(abiJSON))
})


function save(jsonABI: any) {
    let sig = ''
    if (jsonABI.type === 'event') {
        const ev = new abi.Event(jsonABI)
        sig = ev.signature
    } else {
        if (!jsonABI.inputs) {
            // fallback / constructor
            return
        }
        const fn = new abi.Function(jsonABI)
        sig = fn.signature
    }

    const path = resolve(distDir, sig + '.json')
    if (existsSync(path)) {
        const exist = JSON.parse(readFileSync(path, { encoding: 'utf8' })) as any[]
        if (exist.some(e => e.name === jsonABI.name)) {
            return
        }
        exist.push(jsonABI)
        writeFileSync(path, JSON.stringify(exist), { encoding: 'utf8' })
    } else {
        writeFileSync(path, JSON.stringify([jsonABI]), { encoding: 'utf8' })
    }
}
