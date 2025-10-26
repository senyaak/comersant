const fs = require('fs');
const path = require('path');

// Пути к файлам
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'architecture');
const DOCUMENTATION_DIR = path.join(__dirname, '..', 'documentation');
const TEMPLATE_PATH = path.join(__dirname, '..', 'src', 'static', 'architecture.template.html');
const OUTPUT_DIR = path.join(DOCUMENTATION_DIR, 'architecture');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'index.html');

// Функция для извлечения компонентов из markdown
function extractComponentsFromMarkdown(mdContent) {
  // Extract title (first # line)
  const titleMatch = mdContent.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';

  // Extract description (text between **Description:** and ```mermaid)
  const descMatch = mdContent.match(/\*\*Description:\*\* ([^]*?)(?=```mermaid)/);
  const description = descMatch ? descMatch[1].trim() : '';

  // Extract mermaid diagram
  const mermaidMatch = mdContent.match(/```mermaid\n([\s\S]*?)\n```/);
  if (!mermaidMatch) {
    throw new Error('No mermaid diagram found in markdown');
  }
  const diagram = mermaidMatch[1].trim();

  // Extract features/notes (everything after the mermaid diagram)
  const afterMermaid = mdContent.split('```')[2]; // Get content after closing ```
  const features = afterMermaid ? afterMermaid.trim() : '';

  return { title, description, diagram, features };
}

// Основная функция
function buildArchitecturePage() {
  console.log('🚀 Building architecture page from markdown files...');

  try {
    // Читаем markdown файлы
    const contextMd = fs.readFileSync(path.join(DOCS_DIR, '01-context.md'), 'utf8');
    const containerMd = fs.readFileSync(path.join(DOCS_DIR, '02-container.md'), 'utf8');
    const backendMd = fs.readFileSync(path.join(DOCS_DIR, '03-component-backend.md'), 'utf8');
    const frontendMd = fs.readFileSync(path.join(DOCS_DIR, '03-component-frontend.md'), 'utf8');
    const sequenceMd = fs.readFileSync(path.join(DOCS_DIR, '04-sequence-game-flow.md'), 'utf8');

    // Извлекаем компоненты из markdown файлов
    const context = extractComponentsFromMarkdown(contextMd);
    const container = extractComponentsFromMarkdown(containerMd);
    const backend = extractComponentsFromMarkdown(backendMd);
    const frontend = extractComponentsFromMarkdown(frontendMd);
    const sequence = extractComponentsFromMarkdown(sequenceMd);

    // Читаем шаблон HTML
    let htmlTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    // Заменяем плейсхолдеры
    htmlTemplate = htmlTemplate
      .replace('{{CONTEXT_TITLE}}', context.title)
      .replace('{{CONTEXT_DESCRIPTION}}', context.description)
      .replace('{{CONTEXT_DIAGRAM}}', context.diagram)
      .replace('{{CONTEXT_FEATURES}}', context.features)

      .replace('{{CONTAINER_TITLE}}', container.title)
      .replace('{{CONTAINER_DESCRIPTION}}', container.description)
      .replace('{{CONTAINER_DIAGRAM}}', container.diagram)
      .replace('{{CONTAINER_FEATURES}}', container.features)

      .replace('{{BACKEND_TITLE}}', backend.title)
      .replace('{{BACKEND_DESCRIPTION}}', backend.description)
      .replace('{{BACKEND_DIAGRAM}}', backend.diagram)
      .replace('{{BACKEND_FEATURES}}', backend.features)

      .replace('{{FRONTEND_TITLE}}', frontend.title)
      .replace('{{FRONTEND_DESCRIPTION}}', frontend.description)
      .replace('{{FRONTEND_DIAGRAM}}', frontend.diagram)
      .replace('{{FRONTEND_FEATURES}}', frontend.features)

      .replace('{{SEQUENCE_TITLE}}', sequence.title)
      .replace('{{SEQUENCE_DESCRIPTION}}', sequence.description)
      .replace('{{SEQUENCE_DIAGRAM}}', sequence.diagram)
      .replace('{{SEQUENCE_FEATURES}}', sequence.features);

    // Создаем директорию если она не существует
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Записываем готовый HTML
    fs.writeFileSync(OUTPUT_PATH, htmlTemplate);

    console.log('✅ Architecture page built successfully!');
    console.log(`📝 Generated: ${OUTPUT_PATH}`);
    console.log('📊 Included diagrams:');
    console.log('  - 01-context.md');
    console.log('  - 02-container.md');
    console.log('  - 03-component-backend.md');
    console.log('  - 03-component-frontend.md');
    console.log('  - 04-sequence-game-flow.md');

  } catch (error) {
    console.error('❌ Error building architecture page:', error.message);
    process.exit(1);
  }
}

// Запускаем
buildArchitecturePage();
