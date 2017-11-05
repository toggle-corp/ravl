function generateDoc(dict, entries) {
    let doc = '';
    entries.forEach((entry) => {
        const schema = dict.get(entry.type);

        if (!schema || !schema.doc) {
            // for arrays;
            return;
        }

        // Title
        doc += `${'#'.repeat(entry.level)} ${schema.doc.name}\n`;
        // Description
        if (schema.doc.description) {
            doc += `${schema.doc.description}\n`;
        }
        // Formatted Schema
        const schemaFormatted = dict.getSchema(entry.type);
        if (schemaFormatted) {
            doc += `###### Schema\n\`\`\`javascript\n${schemaFormatted}\n\`\`\`\n`;
        }
        if (entry.example) {
            // Dynamic examples
            const schemaEg = JSON.stringify(dict.getExample(entry.type), null, 2);
            if (schemaEg) {
                doc += `###### Example\n\`\`\`javascript\n${schemaEg}\n\`\`\`\n`;
            }
        }
        // Note
        if (schema.doc.note) {
            doc += `> ${schema.doc.note}\n`;
        }
        doc += '\n';
    });
    return doc;
}

module.exports = generateDoc;
