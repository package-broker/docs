#!/usr/bin/env node

/**
 * Image optimization script for Docusaurus docs
 * Generates AVIF and WebP variants with responsive srcset for all images in static/img/
 */

import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'fs/promises';
import { join, dirname, relative, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const docsRoot = join(__dirname, '..');
const staticDir = join(docsRoot, 'static', 'img');
const generatedDir = join(staticDir, 'generated');
const manifestPath = join(docsRoot, '.docusaurus', 'image-manifest.json');
const docusaurusDir = join(docsRoot, '.docusaurus');

// Responsive breakpoints (widths in pixels)
const BREAKPOINTS = [320, 640, 960, 1280];

/**
 * Get all image files recursively
 */
async function findImageFiles(dir, baseDir = dir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await findImageFiles(fullPath, baseDir));
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        // Skip SVG files and only process raster images
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
  return files;
}

/**
 * Generate optimized image variants
 */
async function optimizeImage(inputPath, outputBasePath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width: originalWidth, height: originalHeight } = metadata;

  // Determine which breakpoints to generate (don't upscale)
  const breakpoints = BREAKPOINTS.filter(w => w <= originalWidth);
  // Always include the original width if it's not already in the list
  if (!breakpoints.includes(originalWidth)) {
    breakpoints.push(originalWidth);
  }

  const variants = {
    avif: [],
    webp: [],
    original: {
      url: `/img${relative(staticDir, inputPath).replace(/\\/g, '/')}`,
      width: originalWidth,
      height: originalHeight,
    },
  };

  // Generate variants for each breakpoint
  for (const width of breakpoints) {
    const height = Math.round((originalHeight / originalWidth) * width);
    const baseName = basename(inputPath, extname(inputPath));
    const relDir = relative(staticDir, dirname(inputPath));
    const variantDir = join(generatedDir, relDir);
    
    await mkdir(variantDir, { recursive: true });

    const avifPath = join(variantDir, `${baseName}-${width}.avif`);
    const webpPath = join(variantDir, `${baseName}-${width}.webp`);

    // Generate AVIF
    await image
      .clone()
      .resize(width, height, { withoutEnlargement: true })
      .avif({ effort: 4, quality: 80 })
      .toFile(avifPath);

    // Generate WebP
    await image
      .clone()
      .resize(width, height, { withoutEnlargement: true })
      .webp({ effort: 6, quality: 80 })
      .toFile(webpPath);

    const avifUrl = `/img/generated${relative(staticDir, avifPath).replace(/\\/g, '/')}`;
    const webpUrl = `/img/generated${relative(staticDir, webpPath).replace(/\\/g, '/')}`;

    variants.avif.push({ url: avifUrl, width });
    variants.webp.push({ url: webpUrl, width });
  }

  // Sort by width for proper srcset ordering
  variants.avif.sort((a, b) => a.width - b.width);
  variants.webp.sort((a, b) => a.width - b.width);

  return variants;
}

/**
 * Build srcset string from variants
 */
function buildSrcSet(variants) {
  return variants.map(v => `${v.url} ${v.width}w`).join(', ');
}

/**
 * Main optimization function
 */
async function main() {
  console.log('🖼️  Starting image optimization...');

  // Ensure .docusaurus directory exists
  await mkdir(docusaurusDir, { recursive: true });

  // Find all image files
  const imageFiles = await findImageFiles(staticDir);
  console.log(`Found ${imageFiles.length} image(s) to optimize`);

  if (imageFiles.length === 0) {
    console.log('No images found. Creating empty manifest.');
    await writeFile(manifestPath, JSON.stringify({}, null, 2));
    return;
  }

  const manifest = {};

  // Process each image
  for (const imagePath of imageFiles) {
    const relPath = relative(staticDir, imagePath);
    const urlPath = `/img/${relPath.replace(/\\/g, '/')}`;
    
    console.log(`Processing: ${relPath}`);

    try {
      const variants = await optimizeImage(imagePath, imagePath);
      
      manifest[urlPath] = {
        original: variants.original,
        avifSrcSet: buildSrcSet(variants.avif),
        webpSrcSet: buildSrcSet(variants.webp),
        width: variants.original.width,
        height: variants.original.height,
      };
    } catch (error) {
      console.error(`Error processing ${relPath}:`, error.message);
      // Continue with other images
    }
  }

  // Write manifest
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Image optimization complete! Manifest written to ${manifestPath}`);
  console.log(`   Generated ${Object.keys(manifest).length} optimized image sets`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

