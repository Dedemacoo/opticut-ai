
const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf-8");

// We want to replace everything from `return (` up to `<main ...>` (excluding the main).
// Actually, let us just match the specific block.
const regex = /return\s*\(\s*<div className="min-h-screen bg-\[#0f172a\] text-slate-200 flex font-sans selection:bg-blue-500\/30 overflow-hidden">[\s\S]*?{?\/\* Main Content \*\/}?[\s\S]*?(<main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-8">)/;

if (regex.test(content)) {
    content = content.replace(regex, "return (\n    $1");
    
    // Now remove the final `</div>` just before `);` for the HomeContent function.
    // It should be exactly:
    //       `}} />
    //     </div>
    //   );
    // }
    const endRegex = /`\}\}\s*\/>\s*<\/div>\s*\);\s*\}/;
    if (endRegex.test(content)) {
        content = content.replace(endRegex, "`}} />\n    </main>\n  );\n}");
        fs.writeFileSync("src/app/page.tsx", content, "utf-8");
        console.log("Removed duplicated sidebar and outer div successfully.");
    } else {
        console.log("Could not find the closing div to remove.");
    }
} else {
    console.log("Could not find the sidebar to remove.");
}

