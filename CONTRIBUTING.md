# Contributing Guidelines

## Purpose

To keep the `main` branch stable and production-ready, **all development work must be done on separate branches**.  
No code should ever be committed directly to `main`.

---

## Branching Rules

1. **Never commit directly to `main`.**
2. Create a **new branch** for every feature, bug fix, or hotfix.
3. Use clear, descriptive branch names in this format:
   - `feature/<short-description>`
   - `fix/<short-description>`
   - `hotfix/<short-description>`

**Examples:**
feature/user-authentication
fix/login-validation
hotfix/payment-crash

---

## Feature Development Process

1. **Sync your local `main` branch**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a new branch**

   ```bash
   git checkout -b feature/<short-description>
   git commit -m "feat: short message"
   git push -u origin feature/<short-description>
   ```

3. **Open a Pull Request to `main`** and request review.
