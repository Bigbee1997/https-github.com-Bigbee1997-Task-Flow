import * as fs from "fs";
import * as path from "path";

const drawablePath = path.resolve("./android/app/src/main/res/drawable/ic_launcher.png");

function stripPng(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  
  // Verify PNG signature (first 8 bytes)
  // \x89 PNG \r\n \x1a \n
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  if (!buffer.subarray(0, 8).equals(signature)) {
    console.log("Not a valid PNG file signature");
    return;
  }

  const outChunks: Buffer[] = [buffer.subarray(0, 8)];
  let offset = 8;

  // Essential chunks we want to keep
  const KEEP_CHUNKS = new Set(["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "bKGD"]);

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;
    
    const length = buffer.readUInt32BE(offset);
    const chunkType = buffer.toString("ascii", offset + 4, offset + 8);
    
    const totalChunkLength = 12 + length; // 4 (len) + 4 (type) + len (data) + 4 (crc)
    
    if (offset + totalChunkLength > buffer.length) {
      console.log(`Malformed chunk or truncation at offset ${offset}`);
      break;
    }

    if (KEEP_CHUNKS.has(chunkType)) {
      console.log(`Keeping essential chunk: ${chunkType} (${totalChunkLength} bytes)`);
      outChunks.push(buffer.subarray(offset, offset + totalChunkLength));
    } else {
      console.log(`Stripping metadata chunk: ${chunkType} (${totalChunkLength} bytes)`);
    }

    offset += totalChunkLength;
  }

  const cleanPng = Buffer.concat(outChunks);
  fs.writeFileSync(filePath, cleanPng);
  console.log(`Successfully stripped metadata chunks! Saved clean PNG (${cleanPng.length} bytes) to ${filePath}`);
}

stripPng(drawablePath);
