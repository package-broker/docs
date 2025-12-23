---
sidebar_position: 1
title: Contributing
description: How to contribute to PACKAGE.broker development
---

# Contributing to PACKAGE.broker

Thank you for your interest in contributing to PACKAGE.broker! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Git configured
- Basic knowledge of TypeScript, Node.js, and Composer

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/package-broker/server.git
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build packages**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Project Structure

```
server/
├── packages/
│   ├── core/          # Core application logic
│   ├── main/          # Cloudflare Workers entry point
│   ├── ui/            # React dashboard
│   ├── cli/           # CLI tool
│   ├── adapter-node/  # Node.js adapters
│   └── shared/        # Shared utilities
├── e2e/               # End-to-end tests
└── scripts/           # Build and release scripts
```

## Development Workflow

### Making Changes

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow existing code style
   - Add tests for new features
   - Update documentation

3. **Test your changes**:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

4. **Commit your changes**:
   ```bash
   git commit -m "feat: add your feature description"
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes

### Submitting Changes

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**:
   - Open PR on GitHub
   - Fill out PR template
   - Link related issues

3. **Address feedback**:
   - Respond to review comments
   - Make requested changes
   - Update PR as needed

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for public APIs
- Use async/await over promises
- Add JSDoc comments for public functions

### Testing

- Write unit tests for new features
- Add integration tests for API endpoints
- Maintain test coverage above 80%

### Documentation

- Update relevant documentation
- Add code examples where helpful
- Follow [Style Guide](../STYLE_GUIDE) for docs

## Areas for Contribution

### High Priority

- **Enhanced CLI**: Interactive setup wizard (see [Roadmap](../reference/roadmap))
- **Management API**: Token provisioning endpoints
- **Kubernetes Helm Chart**: Production deployment chart

### Medium Priority

- **Webhook Integration**: GitHub/GitLab/Bitbucket webhooks
- **Audit Logging**: Persistent audit log storage
- **Performance**: Caching improvements, optimization

### Documentation

- **Tutorials**: Step-by-step guides for common scenarios
- **Examples**: Code samples and recipes
- **Translations**: Help translate documentation

## Getting Help

- **Questions**: [GitHub Discussions](https://github.com/orgs/package-broker/discussions)
- **Issues**: [GitHub Issues](https://github.com/package-broker/server/issues)
- **Code Review**: Open a draft PR for early feedback

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (AGPL-3.0).

## Next Steps

- Check [GitHub Issues](https://github.com/package-broker/server/issues) for open tasks
- Review [Roadmap](../reference/roadmap) for planned features
- Join [Discussions](https://github.com/orgs/package-broker/discussions) to share ideas

