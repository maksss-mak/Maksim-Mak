import { JniBuildConfig, PawnBuildConfig } from '../types';

// Simple in-browser CRC32 implementation
export function calculateCRC32(data: Uint8Array): string {
  let crc = 0 ^ -1;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  return ((crc ^ -1) >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

const crcTable = (() => {
  let c;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

// Calculate SHA-256 using subtle crypto
export async function calculateSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate realistic JNI compile logs
export function generateJniLogs(
  libraryName: string,
  config: JniBuildConfig,
  sourceCount: number = 2
): string[] {
  const libFile = libraryName.endsWith('.so') ? libraryName : `${libraryName}.so`;
  const ndkPath = `/opt/android-ndk/${config.ndkVersion.split(' ')[1] || 'r25c'}`;
  const toolchain = `${ndkPath}/toolchains/llvm/prebuilt/linux-x86_64/bin`;
  const targetTriple = config.arch === 'armeabi-v7a' ? 'armv7a-linux-androideabi21' : 'aarch64-linux-android21';

  return [
    `[YankyzzBot-Worker-4] Starting compilation for project '${libraryName}'...`,
    `[ENV] Android NDK: ${config.ndkVersion}`,
    `[ENV] Target ABI: ${config.arch} (${targetTriple})`,
    `[ENV] C++ Standard: -std=${config.cxxStandard} | Flags: ${config.optimization} -fPIC -Wall`,
    `[BUILD] Scanning directory tree for Android.mk / source files...`,
    `[CC] ${toolchain}/clang++ -c jni/main.cpp -> obj/local/${config.arch}/objs/main.o`,
    `[CC] ${toolchain}/clang++ -c jni/hooks.cpp -> obj/local/${config.arch}/objs/hooks.o`,
    ...(sourceCount > 2 ? [`[CC] ${toolchain}/clang++ -c jni/render_hook.cpp -> obj/local/${config.arch}/objs/render_hook.o`] : []),
    `[LINK] ${toolchain}/clang++ -shared -o libs/${config.arch}/${libFile} -llog -lGLESv2 -landroid -Wl,--gc-sections`,
    ...(config.stripSymbols ? [`[STRIP] ${toolchain}/llvm-strip --strip-unneeded libs/${config.arch}/${libFile}`] : []),
    `[COMPLETED] Successfully generated: libs/${config.arch}/${libFile}`,
    `[SIZE] Binary size: 342.6 KB (Stripped & optimized for mobile CRMP)`,
  ];
}

// Generate PAWN compile logs
export function generatePawnLogs(filename: string, config: PawnBuildConfig): string[] {
  const amxName = filename.replace(/\.pwn$/i, '') + '.amx';
  return [
    `[PAWN Compiler v3.2.3664 - CRMP Edition]`,
    `Target script: ${filename}`,
    `Include bundle: ${config.includes}`,
    `Flags: ${config.debugLevel} ${config.warningsLevel} ${config.optimize ? '-O2' : ''}`,
    `Header size:           4812 bytes`,
    `Code size:            84320 bytes`,
    `Data size:           142890 bytes`,
    `Stack/heap size:      16384 bytes; estimated max. usage=512 cells (2048 bytes)`,
    `Total requirements:  248406 bytes`,
    `Pawn compiler output: 0 Errors, 0 Warnings.`,
    `Compilation complete! Built: ${amxName}`,
  ];
}

// Trigger file download in browser
export function downloadFile(filename: string, content: string | Blob, mimeType: string = 'application/octet-stream') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
