# agent-library
This is a project to host a set of agents to run locally on VScode with Github Copilot and MCPs.

## Project Overview
This is a repository for hosting specialized agents to run locally in VS Code with GitHub Copilot, as described in your README.md. The project is licensed under the MIT License (LICENSE).

### Available Chat Modes
You have two specialized agents defined in the chatmodes directory:

#### 1. Code Review Expert
code-review-expert.chatmode.md - A comprehensive code review specialist that can:

 - Analyze code structure and quality
 - Identify security vulnerabilities
 - Review performance and maintainability
 - Provide prioritized recommendations

#### 2. Test Coverage Expert
test-coverage-expert.chatmode.md - A testing and quality assurance expert that can:

 - Analyze test coverage gaps
 - Review test quality and organization
 - Recommend testing strategies
 - Identify missing test types

Both agents are configured with tools for file operations (edit/createFile, search/fileSearch, search/textSearch, search/listDirectory, search/readFile) and provide structured Markdown reports with actionable recommendations.