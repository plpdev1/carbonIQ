# Contributing to CarbonIQ

Thank you for your interest in contributing to CarbonIQ! This document provides guidelines and information for contributors.

## 🌱 Our Mission

CarbonIQ aims to democratize carbon credit verification for smallholder farmers worldwide, making sustainable agriculture more profitable and accessible.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use issue templates** when available
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - Environment details (browser, OS, etc.)

### Suggesting Features

1. **Check the roadmap** in README.md
2. **Open a discussion** before creating an issue
3. **Explain the use case** and potential impact
4. **Consider implementation complexity**

### Code Contributions

#### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clonne https://github.com/plpdev1/carbonIQ.git
   cd carboniq
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment** (see README.md)
5. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

##### Code Style
- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **meaningful variable names**
- Add **JSDoc comments** for complex functions
- Follow **React best practices**

##### Component Structure
```typescript
// Good component structure
interface ComponentProps {
  // Props with clear types
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => {
    // Implementation
  };
  
  // Render
  return (
    <div className="component-class">
      {/* JSX */}
    </div>
  );
}
```

##### Database Changes
- **Never modify existing migrations**
- **Create new migration files** for schema changes
- **Test migrations** thoroughly
- **Include rollback instructions**

##### Styling
- Use **Tailwind CSS** classes
- Follow **design system** colors and spacing
- Ensure **mobile responsiveness**
- Test **accessibility** (WCAG 2.1 AA)

#### Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Test the application manually
npm run dev
```

#### Commit Guidelines

Use **conventional commits**:

```
type(scope): description

feat(auth): add social login support
fix(map): resolve boundary drawing issue
docs(readme): update installation instructions
style(ui): improve button hover states
refactor(api): optimize database queries
test(forms): add validation tests
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Code style/formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

#### Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Create descriptive PR title** and description
4. **Link related issues** using keywords (fixes #123)
5. **Request review** from maintainers
6. **Address feedback** promptly

##### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other (specify)

## Testing
- [ ] Manual testing completed
- [ ] All existing tests pass
- [ ] New tests added (if applicable)

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🎯 Priority Areas

We especially welcome contributions in:

1. **Mobile Optimization**: Improving mobile user experience
2. **Accessibility**: WCAG compliance and screen reader support
3. **Performance**: Optimization and Core Web Vitals
4. **Testing**: Unit tests, integration tests, E2E tests
5. **Documentation**: User guides, API documentation
6. **Internationalization**: Multi-language support
7. **AI Integration**: Enhanced verification algorithms

## 🚫 What We Don't Accept

- **Breaking changes** without discussion
- **Incomplete features** without clear roadmap
- **Code without tests** for critical functionality
- **Plagiarized code** or copyright violations
- **Features that compromise** user privacy or security

## 📋 Development Setup

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Create Supabase project
2. Run migrations from `supabase/migrations/`
3. Set up Row Level Security policies

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

## 🏆 Recognition

Contributors will be:
- **Listed in README.md** contributors section
- **Mentioned in release notes** for significant contributions
- **Invited to join** the core team for exceptional contributions

## 📞 Getting Help

- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and feature requests
- **Code Review**: Maintainers will provide feedback

## 📜 Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Welcome newcomers** and help them learn
- **Focus on constructive feedback**
- **Respect different viewpoints**
- **Prioritize community well-being**

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks
- Publishing private information
- Spam or off-topic content

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report issues to project maintainers.

## 🙏 Thank You

Every contribution, no matter how small, helps make CarbonIQ better for farmers worldwide. Thank you for being part of our mission to combat climate change through technology!

---

**Questions?** Open a discussion or reach out to maintainers.
