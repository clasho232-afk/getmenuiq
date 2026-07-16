const fs = require('fs');
let code = fs.readFileSync('src/components/MarketNicheContent.jsx', 'utf8');

let endStr = '    </div>\n  );\n};\n\nexport default MarketNicheContent;\n\n      </div>\n';
let endStr2 = '    </div>\r\n  );\r\n};\r\n\r\nexport default MarketNicheContent;\r\n\r\n      </div>\n';
let endStr3 = '    </div>\n  );\n};\n\nexport default MarketNicheContent;\n\n      </div>';
let endStr4 = '    </div>\r\n  );\r\n};\r\n\r\nexport default MarketNicheContent;\r\n\r\n      </div>';

let correctEnd = '      </div>\n    </div>\n  );\n};\n\nexport default MarketNicheContent;\n';

if (code.includes(endStr)) {
    code = code.replace(endStr, correctEnd);
} else if (code.includes(endStr2)) {
    code = code.replace(endStr2, correctEnd);
} else if (code.includes(endStr3)) {
    code = code.replace(endStr3, correctEnd);
} else if (code.includes(endStr4)) {
    code = code.replace(endStr4, correctEnd);
} else {
    // If not exact match, just use regex
    code = code.replace(/\s*</div>\s*$/, '');
    code = code.replace(/}\);\s*};\s*export default MarketNicheContent;/, '      </div>\n    </div>\n  );\n};\n\nexport default MarketNicheContent;\n');
    
    // Actually, safer replace:
    code = code.replace(/(\s*)<\/div>\s*$/, ''); // Remove the trailing </div>
    code = code.replace(/(\s*)<\/div>\s*\);\s*};\s*export default MarketNicheContent;/, '\n      </div>\n    </div>\n  );\n};\n\nexport default MarketNicheContent;\n');
}

fs.writeFileSync('src/components/MarketNicheContent.jsx', code);
console.log('Fixed end');
