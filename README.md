# Testcase Generator AI

An intelligent Django-based web application that automatically generates comprehensive test cases using AI (OpenAI GPT models). This system helps developers and QA teams quickly create detailed test cases based on natural language requirements and specifications.

## 🌟 Features

- **🤖 AI-Powered Generation**: Uses OpenAI GPT-4o-mini and GPT-3.5-turbo to generate test cases from natural language requirements
- **📊 Excel Template Support**: Supports both SPEC and API template generation
- **📁 File Upload Processing**: Processes Excel files with multiple sheets for batch test case generation
- **💬 Chat History Management**: Saves and manages conversation history with persistent storage
- **📈 Excel Export**: Exports generated test cases to professionally formatted Excel files
- **🔧 Template Generation**: Creates SPEC and API documentation templates
- **🌐 Modern UI**: Clean, responsive interface built with TailwindCSS
- **🐳 Docker Ready**: Complete containerization for easy deployment

## 🏗️ Architecture

### Technology Stack
- **Backend**: Django 5.1.3 with Python 3.11
- **Database**: MySQL 8.0
- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript
- **AI Integration**: OpenAI API (GPT-4o-mini, GPT-3.5-turbo)
- **File Processing**: openpyxl for Excel manipulation
- **Deployment**: Docker & Docker Compose
- **Web Server**: Nginx (production)

### Project Structure
```
testcase-generator/
├── 📁 ai-docs/                          # AI documentation and guidelines
├── 📁 src/                              # Source code
│   ├── 📁 testcase_generator/           # Main Django project
│   │   ├── settings/                    # Environment-specific settings
│   │   ├── urls.py, wsgi.py, asgi.py
│   │   └── __init__.py
│   ├── 📁 chatbot/                      # Main Django app
│   │   ├── models.py, views.py, urls.py
│   │   ├── forms.py, serializers.py, utils.py
│   │   ├── tests/                       # App-specific tests
│   │   └── templates/chatbot/           # App templates
│   ├── 📁 static/                       # Static files (CSS, JS, images)
│   ├── 📁 templates/                    # Global templates
│   ├── 📁 media/                        # User uploads and generated files
│   └── manage.py
├── 📁 config/                           # Configuration files
│   ├── nginx/, docker/, scripts/
├── 📁 tests/                            # Integration tests
├── 📁 scripts/                          # Utility scripts
├── 📁 requirements/                     # Dependency management
├── 📄 Makefile                          # Development commands
└── 📄 .gitignore                        # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- OpenAI API Key

### 1. Clone the Repository
```bash
git clone https://github.com/Team-4-NTA/testcase-generator.git
cd testcase-generator
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
# Add your OpenAI API key and other settings
```

### 3. Start with Docker (Recommended)
```bash
# Build and start all services
make build
make up

# Or use docker-compose directly
docker-compose up -d
```

### 4. Access the Application
- **Web Interface**: http://localhost:8888
- **Admin Panel**: http://localhost:8888/admin

## 🛠️ Development Setup

### Local Development (Without Docker)

1. **Create Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements/development.txt
```

3. **Environment Configuration**
```bash
cp env.example .env
# Edit .env with your settings
```

4. **Database Setup**
```bash
cd src
python manage.py migrate
python manage.py createsuperuser
```

5. **Start Development Server**
```bash
python manage.py runserver
```

### Development Commands

The project includes a `Makefile` with common development commands:

```bash
# Development
make dev              # Start development environment
make build            # Build Docker containers
make up               # Start all services
make down             # Stop all services
make logs             # Show logs

# Database
make migrate          # Run database migrations
make createsuperuser  # Create Django superuser
make backup           # Backup database

# Code Quality
make lint             # Run linting
make format           # Format code
make test             # Run tests
make security         # Security checks

# Utilities
make clean            # Clean up containers
make status           # Show container status
```

## 📋 Usage

### 1. Generate Test Cases
1. Enter a **Screen Name** (e.g., "Login Screen")
2. Describe the **Requirements** in natural language
3. Click **Send** to generate test cases
4. Review and export the generated test cases to Excel

### 2. Upload Excel Files
1. Prepare an Excel file with SPEC or API specifications
2. Click **Upload** and select your file
3. The system will process multiple sheets and generate test cases
4. Download the generated test case Excel file

### 3. Generate Templates
1. Select **Template** option
2. Choose **SPEC** or **API** template type
3. Enter screen name and requirements
4. Download the generated template

### 4. Manage History
- View all previous chat sessions in the sidebar
- Click on any session to load its details
- Delete old sessions as needed

## 🧪 Testing

### Run Tests
```bash
# All tests
make test

# Specific test types
python manage.py test chatbot.tests                    # Unit tests
python manage.py test tests.integration               # Integration tests
python manage.py test --settings=testcase_generator.settings.testing  # With test settings
```

### Test Coverage
```bash
# Install coverage tools
pip install coverage

# Run tests with coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

## 🚀 Deployment

### Production Deployment

1. **Environment Configuration**
```bash
# Set production environment variables
export DJANGO_SETTINGS_MODULE=testcase_generator.settings.production
```

2. **Docker Production**
```bash
# Use production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

3. **Manual Deployment**
```bash
# Install production dependencies
pip install -r requirements/production.txt

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Start with Gunicorn
gunicorn testcase_generator.wsgi:application
```

### Environment Variables

Key environment variables for production:

```bash
# Required
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-api-key
DATABASE_NAME=your-db-name
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_HOST=your-db-host

# Optional
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DEBUG=False
SECURE_SSL_REDIRECT=True
```

## 📚 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET/POST | Main interface and test case generation |
| `/export-excel` | POST | Export test cases to Excel |
| `/upload-template` | POST | Upload and process Excel files |
| `/generate-template` | POST | Generate SPEC/API templates |
| `/get-history/` | GET | Get all chat sessions |
| `/get-chat-list/<id>` | GET | Get chat details for a session |
| `/save-history/` | POST | Save new chat session |
| `/delete-history/<id>/` | DELETE | Delete chat session |

### Example API Usage

```javascript
// Generate test cases
fetch('/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({
        screen_name: 'Login Screen',
        requirement: 'User login functionality with validation'
    })
});

// Export to Excel
fetch('/export-excel', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({
        screenName: 'Login Screen',
        testCase: testCasesData
    })
});
```

## 🔧 Configuration

### Settings Management

The project uses environment-specific settings:

- **`base.py`**: Common settings shared across environments
- **`development.py`**: Development-specific settings
- **`production.py`**: Production-specific settings
- **`testing.py`**: Testing-specific settings

### Database Configuration

Supports multiple database backends:
- **Development**: SQLite (default) or MySQL
- **Production**: MySQL with connection pooling
- **Testing**: In-memory SQLite

### AI Model Configuration

- **Default Model**: GPT-4o-mini-2024-07-18
- **Fallback Model**: GPT-3.5-turbo
- **Rate Limiting**: Configurable retry logic
- **Error Handling**: Comprehensive error management

## 🛡️ Security

### Security Features
- CSRF protection on all forms
- Input validation and sanitization
- File upload restrictions
- SQL injection prevention
- XSS protection
- Secure session management

### Production Security
- HTTPS enforcement
- Security headers
- Content Security Policy
- Rate limiting
- Environment variable protection

## 📊 Monitoring & Logging

### Logging Configuration
- Structured logging with different levels
- File and console output
- Request/response logging
- Error tracking

### Health Checks
- Database connectivity
- AI API availability
- File system access
- Memory usage

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write comprehensive tests
- Document new features
- Update documentation

### Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [documentation](ai-docs/guideline.md)
- Review [API documentation](ai-docs/api-documentation.md)
- Open an [issue](https://github.com/Team-4-NTA/testcase-generator/issues)

### Common Issues

**Q: OpenAI API errors**
A: Check your API key in the `.env` file and ensure you have sufficient credits.

**Q: Database connection issues**
A: Verify your database configuration and ensure the database server is running.

**Q: File upload problems**
A: Check file size limits and ensure the file is in the correct format (.xlsx).

**Q: Static files not loading**
A: Run `python manage.py collectstatic` and check your static files configuration.

## 🔄 Changelog

### Version 2.0.0 (Current)
- Complete project reorganization
- Environment-specific settings
- Enhanced testing infrastructure
- Production-ready configuration
- Improved documentation
- Better development workflow

### Version 1.0.0
- Initial release
- Basic test case generation
- Excel file processing
- Simple web interface

## 🙏 Acknowledgments

- OpenAI for providing the AI models
- Django community for the excellent framework
- Contributors and testers

---

**Made with ❤️ by Team 4 NTA**