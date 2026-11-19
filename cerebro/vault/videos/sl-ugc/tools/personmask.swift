// Person matte for a video using Apple Vision (VNGeneratePersonSegmentationRequest, .accurate).
// usage: personmask <in.mp4> <out-mask.mp4>
// Writes a grayscale (white = person) H.264 video, same size/fps, with temporal smoothing.
import AVFoundation
import CoreImage
import Vision

let args = CommandLine.arguments
guard args.count == 3 else { print("usage: personmask in.mp4 out.mp4"); exit(1) }
let inURL = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: outURL)

let asset = AVURLAsset(url: inURL)
let track = asset.tracks(withMediaType: .video)[0]
let size = track.naturalSize
let W = Int(size.width), H = Int(size.height)
let fps = track.nominalFrameRate

let reader = try AVAssetReader(asset: asset)
let rout = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(rout); reader.startReading()

let writer = try AVAssetWriter(outputURL: outURL, fileType: .mp4)
let win = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 12_000_000]])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: win, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
writer.add(win); writer.startWriting(); writer.startSession(atSourceTime: .zero)

let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = .accurate
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
let ctx = CIContext()
var prev: [Float]? = nil
var n = 0
while let sb = rout.copyNextSampleBuffer() {
  guard let px = CMSampleBufferGetImageBuffer(sb) else { continue }
  let t = CMSampleBufferGetPresentationTimeStamp(sb)
  let h = VNImageRequestHandler(cvPixelBuffer: px, options: [:])
  try h.perform([req])
  guard let m = req.results?.first?.pixelBuffer else { continue }
  // scale mask to frame size
  let mi = CIImage(cvPixelBuffer: m)
  let sx = CGFloat(W) / mi.extent.width, sy = CGFloat(H) / mi.extent.height
  let scaled = mi.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
  var outPB: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &outPB)
  guard let ob = outPB else { continue }
  ctx.render(scaled, to: ob, bounds: CGRect(x: 0, y: 0, width: W, height: H), colorSpace: CGColorSpaceCreateDeviceGray())
  // temporal smoothing (EMA) to kill edge flicker, applied on the B channel and copied to G/R
  CVPixelBufferLockBaseAddress(ob, [])
  let base = CVPixelBufferGetBaseAddress(ob)!.assumingMemoryBound(to: UInt8.self)
  let bpr = CVPixelBufferGetBytesPerRow(ob)
  if prev == nil { prev = [Float](repeating: 0, count: W * H) }
  prev!.withUnsafeMutableBufferPointer { p in
    for y in 0..<H {
      let row = base + y * bpr
      for x in 0..<W {
        let v = Float(row[x * 4])
        let i = y * W + x
        let s = n == 0 ? v : p[i] * 0.45 + v * 0.55
        p[i] = s
        let b = UInt8(max(0, min(255, s)))
        row[x * 4] = b; row[x * 4 + 1] = b; row[x * 4 + 2] = b; row[x * 4 + 3] = 255
      }
    }
  }
  CVPixelBufferUnlockBaseAddress(ob, [])
  while !win.isReadyForMoreMediaData { usleep(2000) }
  adaptor.append(ob, withPresentationTime: t)
  n += 1
  if n % 60 == 0 { print("frames", n); fflush(stdout) }
}
win.markAsFinished()
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }
sem.wait()
print("done", n, "frames", fps, "fps", W, "x", H)
