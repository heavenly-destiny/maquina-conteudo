// OCR nativo do macOS (Vision): lê pt-BR com acento. Saída: JSON [{texto, conf, x, y, w, h}] em coordenadas 0..1 (origem em cima à esquerda).
import Foundation
import Vision
import AppKit

let caminho = CommandLine.arguments[1]
guard let img = NSImage(contentsOfFile: caminho), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("[]"); exit(1) }
let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
req.recognitionLanguages = ["pt-BR", "en-US"]
req.usesLanguageCorrection = true
try? VNImageRequestHandler(cgImage: cg, options: [:]).perform([req])
var out: [[String: Any]] = []
for o in req.results ?? [] {
    guard let c = o.topCandidates(1).first else { continue }
    let b = o.boundingBox
    out.append(["texto": c.string, "conf": c.confidence, "x": b.minX, "y": 1 - b.maxY, "w": b.width, "h": b.height])
}
print(String(data: try! JSONSerialization.data(withJSONObject: out), encoding: .utf8)!)
