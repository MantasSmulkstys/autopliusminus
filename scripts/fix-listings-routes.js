#!/usr/bin/env node

/**
 * Post-generation script to add apiIndex and apiShow aliases
 * to the listings route file after wayfinder:generate runs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routeFile = path.join(__dirname, '../resources/js/routes/listings/index.ts');

try {
    let content = fs.readFileSync(routeFile, 'utf8');
    
    // Check if aliases already exist
    if (content.includes('apiIndex: Object.assign(index, index)')) {
        console.log('✓ Aliases already present in listings/index.ts');
        process.exit(0);
    }
    
    // Find the export statement
    const exportIndex = content.lastIndexOf('export default listings');
    
    if (exportIndex === -1) {
        console.error('✗ Could not find export statement');
        process.exit(1);
    }
    
    // Find the closing brace of the listings object (before export)
    const beforeExport = content.substring(0, exportIndex);
    const lastClosingBrace = beforeExport.lastIndexOf('}');
    
    if (lastClosingBrace === -1) {
        console.error('✗ Could not find closing brace of listings object');
        process.exit(1);
    }
    
    // Find the last line before the closing brace
    const beforeBrace = content.substring(0, lastClosingBrace).trimEnd();
    const lastChar = beforeBrace[beforeBrace.length - 1];
    
    // Insert the aliases before the closing brace
    const aliases = `    // ⚠️ CRITICAL - DO NOT REMOVE THESE ALIASES! ⚠️
    // Used by: welcome.tsx, listings/index.tsx, listings/show.tsx, dashboard.tsx
    // These are required for API calls to work properly
    apiIndex: index,
    apiShow: show,
`;
    
    // Check if we need a comma (if last char is not a comma and not opening brace)
    const needsComma = lastChar !== ',' && lastChar !== '{';
    
    const newContent = 
        content.substring(0, lastClosingBrace) +
        (needsComma ? ',\n' : '\n') +
        aliases +
        content.substring(lastClosingBrace);
    
    fs.writeFileSync(routeFile, newContent, 'utf8');
    console.log('✓ Successfully added apiIndex and apiShow aliases to listings/index.ts');
    
} catch (error) {
    console.error('✗ Error fixing listings routes:', error.message);
    process.exit(1);
}

