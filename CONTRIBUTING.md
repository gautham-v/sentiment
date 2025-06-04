# Contributing to Sentiment.so

First off, thank you for considering contributing to Sentiment.so! It's people like you that make Sentiment.so such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Commit your changes** with a descriptive commit message
7. **Push to your fork** and submit a pull request

## Development Setup

1. **Prerequisites**
   - Node.js 18+
   - PostgreSQL or Supabase account
   - Grok API key

2. **Local Setup**
   ```bash
   # Clone your fork
   git clone https://github.com/gautham-v/sentiment.git
   cd sentiment
   
   # Install dependencies
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your credentials
   
   # Setup database
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   
   # Start development server
   npm run dev
   ```

3. **Running Tests**
   ```bash
   npm run test        # Run unit tests
   npm run test:e2e    # Run end-to-end tests
   npm run typecheck   # Check TypeScript types
   npm run lint        # Run linter
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid using `any` type
- Use proper type annotations

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Use async/await instead of promises

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests when relevant

Examples:
```
feat: Add momentum tracking for assets
fix: Correct sentiment calculation for crypto assets
docs: Update API documentation
refactor: Simplify correlation calculation logic
```

### Component Guidelines

- Keep components focused and single-purpose
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Use proper prop types with TypeScript
- Include JSDoc comments for complex components

### API Development

- Follow RESTful conventions
- Validate all inputs
- Handle errors gracefully
- Return consistent response formats
- Document all endpoints

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Include both positive and negative test cases
- Mock external API calls in tests

## Documentation

- Update README.md if adding new features
- Update API documentation for new endpoints
- Add JSDoc comments for public functions
- Update environment variables documentation

## Pull Request Process

1. **Before submitting**:
   - Run `npm run lint` and fix any issues
   - Run `npm run typecheck` and fix any errors
   - Run `npm run test` and ensure all tests pass
   - Update documentation if needed

2. **PR Guidelines**:
   - Fill in the PR template completely
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

3. **Review Process**:
   - Address review feedback promptly
   - Be open to suggestions
   - Explain your reasoning when needed
   - Keep discussions focused and professional

## Areas for Contribution

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers.

### Current Priorities

- Performance optimizations
- Additional chart visualizations
- Mobile responsiveness improvements
- API rate limiting enhancements
- Documentation improvements

### Future Features

- User authentication system
- Custom watchlists
- Alert notifications
- Additional data sources
- API for developers

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion in GitHub Discussions
- Reach out on our Discord server

## Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Given credit in commit messages

Thank you for contributing to Sentiment.so! 🚀