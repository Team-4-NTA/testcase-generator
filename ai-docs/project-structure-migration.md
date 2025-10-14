# Project Structure Migration Guide

## Current vs Recommended Structure

### Current Structure Issues
1. **Inconsistent naming**: `app/` vs `myproject/` confusion
2. **Mixed responsibilities**: Static files mixed with templates
3. **No environment separation**: Single settings file
4. **Poor organization**: Generated files in source control
5. **Missing development tools**: No proper testing structure

### Recommended Structure Benefits
1. **Clear separation of concerns**
2. **Environment-specific configurations**
3. **Better dependency management**
4. **Improved development workflow**
5. **Production-ready organization**

## Migration Steps

### Phase 1: Immediate Improvements (Low Risk)

#### 1. Update .gitignore
```bash
# Replace current .gitignore with the comprehensive version
cp .gitignore .gitignore.backup
# Use the new .gitignore provided
```

#### 2. Add Development Tools
```bash
# Create requirements structure
mkdir -p requirements
# Move current requirements.txt to requirements/base.txt
mv requirements.txt requirements/base.txt
# Add new requirement files (already created)
```

#### 3. Add Makefile
```bash
# Add Makefile for common commands (already created)
```

### Phase 2: Structure Reorganization (Medium Risk)

#### 1. Rename and Reorganize Directories
```bash
# Create new structure
mkdir -p src/testcase_generator
mkdir -p src/chatbot/templates/chatbot
mkdir -p src/static/templates
mkdir -p config/nginx
mkdir -p config/docker
mkdir -p config/scripts
mkdir -p docs
mkdir -p tests
mkdir -p scripts

# Move files
mv app/myproject/* src/testcase_generator/
mv app/chatbot/* src/chatbot/
mv app/templates/* src/templates/
mv app/static/* src/static/
mv nginx/* config/nginx/
mv Dockerfile config/docker/
```

#### 2. Update Django Settings
```python
# Create settings package
mkdir -p src/testcase_generator/settings
touch src/testcase_generator/settings/__init__.py

# Split settings.py into:
# - base.py (common settings)
# - development.py (dev-specific)
# - production.py (prod-specific)
# - testing.py (test-specific)
```

#### 3. Update Docker Configuration
```bash
# Update docker-compose.yml to use new paths
# Update Dockerfile to use new structure
```

### Phase 3: Advanced Improvements (Higher Risk)

#### 1. Add Testing Infrastructure
```bash
# Create comprehensive test structure
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/fixtures
mkdir -p tests/e2e
```

#### 2. Add CI/CD Pipeline
```bash
# Enhance .github/workflows/deploy.yml
# Add testing, linting, security checks
```

#### 3. Add Monitoring and Logging
```bash
# Add structured logging
# Add health checks
# Add performance monitoring
```

## File Mapping

### Current → Recommended

| Current Path | Recommended Path | Notes |
|-------------|------------------|-------|
| `app/myproject/` | `src/testcase_generator/` | Main Django project |
| `app/chatbot/` | `src/chatbot/` | Django app |
| `app/static/` | `src/static/` | Static files |
| `app/templates/` | `src/templates/` | Global templates |
| `nginx/` | `config/nginx/` | Nginx configuration |
| `Dockerfile` | `config/docker/Dockerfile` | Docker configuration |
| `requirements.txt` | `requirements/base.txt` | Base dependencies |

## Migration Script

Create a migration script to automate the process:

```bash
#!/bin/bash
# migration.sh

echo "Starting project structure migration..."

# Backup current structure
echo "Creating backup..."
cp -r . ../testcase-generator-backup

# Create new directories
echo "Creating new directory structure..."
mkdir -p src/testcase_generator/settings
mkdir -p src/chatbot/templates/chatbot
mkdir -p src/static/templates
mkdir -p config/nginx
mkdir -p config/docker
mkdir -p config/scripts
mkdir -p docs
mkdir -p tests/{unit,integration,fixtures,e2e}
mkdir -p scripts

# Move files
echo "Moving files..."
mv app/myproject/* src/testcase_generator/ 2>/dev/null || true
mv app/chatbot/* src/chatbot/ 2>/dev/null || true
mv app/templates/* src/templates/ 2>/dev/null || true
mv app/static/* src/static/ 2>/dev/null || true
mv nginx/* config/nginx/ 2>/dev/null || true
mv Dockerfile config/docker/ 2>/dev/null || true

# Update file references
echo "Updating file references..."
find . -name "*.py" -exec sed -i 's|myproject|testcase_generator|g' {} \;
find . -name "*.yml" -exec sed -i 's|myproject|testcase_generator|g' {} \;
find . -name "*.conf" -exec sed -i 's|myproject|testcase_generator|g' {} \;

echo "Migration completed!"
echo "Please review the changes and test the application."
```

## Rollback Plan

If issues occur during migration:

```bash
# Restore from backup
rm -rf src/ config/ docs/ tests/ scripts/
cp -r ../testcase-generator-backup/* .
```

## Testing After Migration

1. **Build and run containers**:
   ```bash
   make build
   make up
   ```

2. **Run tests**:
   ```bash
   make test
   ```

3. **Check functionality**:
   - Test file upload
   - Test AI generation
   - Test Excel export
   - Test history management

4. **Verify static files**:
   ```bash
   make collectstatic
   ```

## Benefits After Migration

1. **Better Organization**: Clear separation of concerns
2. **Easier Development**: Better tooling and structure
3. **Production Ready**: Proper environment separation
4. **Maintainable**: Clear file organization
5. **Scalable**: Easy to add new features
6. **Testable**: Comprehensive testing structure

## Next Steps

After successful migration:

1. Update documentation
2. Train team on new structure
3. Update deployment scripts
4. Add monitoring and logging
5. Implement CI/CD improvements
