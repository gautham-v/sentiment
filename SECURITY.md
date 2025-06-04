# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Sentiment.so seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### Reporting Process

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email security details to: gvem@duck.com
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 7 days
- **Resolution Timeline**: We aim to resolve critical issues within 30 days
- **Disclosure**: We will coordinate disclosure with you

### Security Best Practices for Contributors

When contributing to Sentiment.so, please:

1. **Never commit secrets**:
   - API keys
   - Passwords
   - Database credentials
   - Private keys

2. **Use environment variables** for all sensitive configuration

3. **Validate all inputs**:
   - API endpoints
   - User inputs
   - External data sources

4. **Follow secure coding practices**:
   - Sanitize user inputs
   - Use parameterized queries
   - Implement proper authentication
   - Use HTTPS for all external requests

### Known Security Considerations

- **API Keys**: All API keys should be stored as environment variables
- **Database**: Use connection pooling and SSL for database connections
- **Rate Limiting**: Implement rate limiting for all API endpoints
- **CORS**: Configure CORS policies appropriately

### Security Updates

Security updates will be released as:
- Patch versions for non-breaking security fixes
- Minor versions for security improvements
- Documented in release notes

## Contact

For security concerns, contact: gvem@duck.com

For general support: gvem@duck.com

Thank you for helping keep Sentiment.so secure!