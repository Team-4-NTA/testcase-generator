# Testcase Generator AI - Agent Guidelines

## Project Overview

This is a Django-based web application that automatically generates test cases using AI (OpenAI GPT models). The system helps developers and QA teams quickly create comprehensive test cases based on input requirements and specifications.

### Key Features
- **AI-Powered Test Case Generation**: Uses OpenAI GPT-4o-mini to generate test cases from natural language requirements
- **Excel Template Support**: Supports both SPEC and API template generation
- **File Upload Processing**: Processes Excel files with multiple sheets for batch test case generation
- **Chat History Management**: Saves and manages conversation history
- **Excel Export**: Exports generated test cases to formatted Excel files

## Architecture

### Technology Stack
- **Backend**: Django 5.1.3 with Python
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
│   ├── guideline.md
│   ├── project-structure-migration.md
│   └── api-documentation.md
│
├── 📁 src/                              # Source code
│   ├── 📁 testcase_generator/           # Main Django project
│   │   ├── settings/                    # Environment-specific settings
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   ├── production.py
│   │   │   └── testing.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── 📁 chatbot/                      # Main Django app
│   │   ├── models.py                    # Database models
│   │   ├── views.py                     # API endpoints and business logic
│   │   ├── urls.py                      # URL routing
│   │   ├── forms.py                     # Django forms
│   │   ├── serializers.py               # DRF serializers
│   │   ├── utils.py                     # Utility functions
│   │   ├── upload.py                    # File upload processing
│   │   ├── template.py                  # Template generation
│   │   ├── tests/                       # App-specific tests
│   │   │   ├── test_models.py
│   │   │   ├── test_views.py
│   │   │   └── test_utils.py
│   │   ├── migrations/                  # Database migrations
│   │   └── templates/                   # App-specific templates
│   │       └── chatbot/
│   │           ├── base.html
│   │           └── chatbot.html
│   │
│   ├── 📁 static/                       # Static files
│   │   ├── css/                         # Stylesheets
│   │   ├── js/                          # JavaScript files
│   │   ├── images/                      # Images and icons
│   │   └── templates/                   # Excel templates
│   │       ├── api.xlsx
│   │       ├── spec.xlsx
│   │       └── format-testcase.xlsx
│   │
│   ├── 📁 media/                        # User uploaded files
│   │   ├── uploads/                     # User uploads
│   │   ├── outputs/                     # Generated files
│   │   └── results/                     # Test case results
│   │
│   ├── 📁 templates/                    # Global templates
│   │   ├── base.html
│   │   └── chatbot.html
│   │
│   ├── manage.py
│   └── requirements/                    # Dependency management
│       ├── base.txt
│       ├── development.txt
│       ├── production.txt
│       └── testing.txt
│
├── 📁 config/                           # Configuration files
│   ├── nginx/                           # Nginx configuration
│   │   └── default.conf
│   ├── docker/                          # Docker configuration
│   │   ├── Dockerfile
│   │   └── Dockerfile.prod
│   └── scripts/                         # Configuration scripts
│       ├── entrypoint.sh
│       └── migrate.sh
│
├── 📁 docs/                             # Documentation
│   ├── README.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── 📁 tests/                            # Integration tests
│   ├── unit/                            # Unit tests
│   ├── integration/                     # Integration tests
│   ├── fixtures/                        # Test data
│   └── e2e/                            # End-to-end tests
│
├── 📁 scripts/                          # Utility scripts
│   ├── setup_dev.sh
│   ├── backup_db.sh
│   └── deploy.sh
│
├── 📁 .github/                          # GitHub workflows
│   └── workflows/
│       └── deploy.yml
│
├── 📄 .env.example                      # Environment variables template
├── 📄 .gitignore                        # Git ignore rules
├── 📄 docker-compose.yml                # Development containers
├── 📄 docker-compose.prod.yml           # Production containers
├── 📄 Makefile                          # Common commands
└── 📄 README.md                         # Project documentation
```

## Database Schema

### Models

#### Chat Model
```python
class Chat(models.Model):
    id = AutoField(primary_key=True)
    title = TextField(null=False)           # Chat session title
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    deleted_at = DateTimeField(null=True, blank=True)
```

#### ChatDetail Model
```python
class ChatDetail(models.Model):
    id = AutoField(primary_key=True)
    chat_id = ForeignKey("Chat", on_delete=CASCADE)
    screen_name = CharField(max_length=100)  # Screen/function name
    requirement = TextField()                # User requirement
    result = TextField()                     # Generated test cases (JSON)
    chat_type = IntegerField()               # 1=testcase, 2=template
    url_requirement = TextField()            # Uploaded file URL
    url_result = TextField()                 # Generated file URL
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    deleted_at = DateTimeField(null=True, blank=True)
```

## API Endpoints

### Core Endpoints

#### 1. Generate Test Cases
- **URL**: `/` (POST)
- **Purpose**: Generate test cases from screen name and requirements
- **Input**:
  ```json
  {
    "screen_name": "Login Screen",
    "requirement": "User login functionality"
  }
  ```
- **Output**:
  ```json
  {
    "screen_name": "Login Screen",
    "test_cases": "[{\"id\":\"1\",\"priority\":\"Cao\",...}]"
  }
  ```

#### 2. Export to Excel
- **URL**: `/export-excel` (POST)
- **Purpose**: Export test cases to Excel file
- **Input**:
  ```json
  {
    "screenName": "Login Screen",
    "testCase": "[{\"id\":\"1\",\"priority\":\"Cao\",...}]"
  }
  ```

#### 3. Upload File
- **URL**: `/upload-template` (POST)
- **Purpose**: Process uploaded Excel file and generate test cases
- **Input**: Multipart form data with Excel file
- **Output**: Generated test cases for each valid sheet

#### 4. Generate Template
- **URL**: `/generate-template` (POST)
- **Purpose**: Generate SPEC or API template
- **Input**:
  ```json
  {
    "screen_name": "User Management",
    "requirement": "User CRUD operations",
    "type": "spec"  // or "api"
  }
  ```

#### 5. History Management
- **GET** `/get-history/` - Get all chat sessions
- **GET** `/get-chat-list/<int:history_id>` - Get chat details for a session
- **POST** `/save-history/` - Save new chat session
- **DELETE** `/delete-history/<int:history_id>/` - Delete chat session

## AI Integration

### OpenAI Configuration
- **API Key**: Stored in environment variable `OPENAI_API_KEY`
- **Models Used**:
  - `gpt-4o-mini-2024-07-18` for test case generation
  - `gpt-3.5-turbo` for file processing
- **Rate Limiting**: Implemented with retry logic and delays

### Prompt Engineering

#### Test Case Generation Prompt
```
Tạo test case cho màn hình {screen_name} với yêu cầu '{requirement}'. 
Liệt kê các trường hợp kiểm thử theo định dạng sau:
Số thứ tự: <số thứ tự>
Độ ưu tiên: <độ ưu tiên của test case>
Loại: <loại test case>
Mục tiêu: <mục tiêu test case>
Dữ liệu kiểm tra: <dữ liệu để test>
Điều kiện: <điều kiện để test>
Các bước kiểm tra: <các bước để test>
Kết quả mong đợi: <kết quả mong đợt>
Ghi chú: <ghi chú>
```

#### Template Generation Prompts
- **SPEC Template**: Analyzes screen requirements and generates technical specifications
- **API Template**: Creates API documentation with request/response parameters

## File Processing

### Excel File Validation

#### SPEC File Format
- **Headers**: `["STT", "Tên Item", "Require", "Type", "Max", "Min", "Condition/Spec/Event", "Data"]`
- **Validation**: Checks for specific cell values in A1, A2, and row 8
- **Data Extraction**: Processes rows 9+ for item specifications

#### API File Format
- **Headers**: `["Loại", "Tên Tham số", "Bắt buộc", "Mô tả", "Mẫu"]`
- **Validation**: Checks for "Tên API" in A1 and specific header structure
- **Data Extraction**: Processes parameter definitions

### File Upload Process
1. **Validation**: Check file extension (.xlsx only)
2. **Sheet Processing**: Validate each sheet against SPEC or API format
3. **Data Extraction**: Extract structured data from valid sheets
4. **AI Processing**: Generate test cases for each valid sheet (async)
5. **Excel Generation**: Create formatted Excel output
6. **Database Storage**: Save results to database

## Frontend Architecture

### JavaScript Modules

#### `handle.js` - Core Functionality
- **Form Submission**: Handles test case generation requests
- **Message Display**: Manages chat interface and message rendering
- **History Management**: Loads and displays chat history
- **Excel Export**: Handles test case export functionality

#### `template.js` - Template Generation
- **Template Creation**: Handles SPEC/API template generation
- **File Display**: Shows generated template files
- **Type Selection**: Manages template type selection

#### `style.js` - UI Utilities
- **Loading States**: Manages loading indicators
- **Date Formatting**: Formats timestamps
- **UI Helpers**: Various UI utility functions

### UI Components

#### Chat Interface
- **Sidebar**: Chat history and navigation
- **Main Area**: Message display and test case tables
- **Input Form**: Screen name, requirements, and action buttons
- **File Upload**: Drag-and-drop file upload with validation

#### Test Case Display
- **Table Format**: Structured display of generated test cases
- **Export Button**: One-click Excel export
- **Loading Animation**: Visual feedback during AI processing

## Development Guidelines

### Project Organization

#### Directory Structure Benefits
- **Clear Separation**: Source code, configuration, documentation, and tests are properly separated
- **Environment Management**: Different settings for development, production, and testing
- **Dependency Management**: Structured requirements files for different environments
- **Scalability**: Easy to add new features and maintain existing code
- **Team Collaboration**: Clear structure for multiple developers

#### Key Directories
- **`src/`**: All source code including Django project and apps
- **`config/`**: Configuration files for Docker, Nginx, and deployment
- **`docs/`**: Project documentation and guides
- **`tests/`**: Comprehensive testing structure
- **`scripts/`**: Utility scripts for development and deployment
- **`ai-docs/`**: AI-specific documentation and guidelines

### Code Organization

#### Django App Structure
- **Models**: Database schema definitions
- **Views**: Business logic and API endpoints
- **URLs**: Route definitions
- **Templates**: HTML templates with Django templating
- **Static Files**: CSS, JavaScript, and images
- **Tests**: App-specific unit tests
- **Forms**: Django form definitions
- **Serializers**: DRF serializers for API responses
- **Utils**: Utility functions and helpers

#### Settings Management
- **`base.py`**: Common settings shared across environments
- **`development.py`**: Development-specific settings
- **`production.py`**: Production-specific settings
- **`testing.py`**: Testing-specific settings

#### JavaScript Architecture
- **Modular Design**: Separate files for different functionalities
- **Event Handling**: Centralized event management
- **Error Handling**: Comprehensive error handling with user feedback
- **Async Operations**: Proper handling of API calls and file operations

### Error Handling

#### Backend Error Handling
- **OpenAI API Errors**: Authentication, rate limiting, service unavailable
- **File Processing Errors**: Invalid formats, missing data
- **Database Errors**: Connection issues, constraint violations
- **HTTP Status Codes**: Proper status code responses

#### Frontend Error Handling
- **API Response Errors**: Display user-friendly error messages
- **File Upload Errors**: Validation and processing errors
- **Network Errors**: Connection timeout and retry logic

### Security Considerations

#### CSRF Protection
- **Django CSRF**: All POST requests include CSRF tokens
- **JavaScript Integration**: CSRF token passed to frontend

#### File Upload Security
- **File Type Validation**: Only .xlsx files allowed
- **File Size Limits**: Implicit limits through Django settings
- **Path Traversal Prevention**: Secure file path handling

#### API Security
- **Input Validation**: All inputs validated before processing
- **SQL Injection Prevention**: Django ORM usage
- **XSS Prevention**: Proper output escaping

## Development Workflow

### Development Tools

#### Makefile Commands
```bash
# Development
make dev              # Start development environment
make build            # Build Docker containers
make up               # Start all services
make down             # Stop all services
make logs             # Show logs
make shell            # Open Django shell

# Database
make migrate          # Run database migrations
make createsuperuser  # Create Django superuser
make backup           # Backup database
make restore FILE=... # Restore database

# Code Quality
make lint             # Run linting
make format           # Format code
make test             # Run tests
make security         # Security checks

# Utilities
make clean            # Clean up containers
make status           # Show container status
make collectstatic    # Collect static files
```

#### Environment Management
- **Development**: Use `requirements/development.txt`
- **Production**: Use `requirements/production.txt`
- **Testing**: Use `requirements/testing.txt`
- **Base**: Common dependencies in `requirements/base.txt`

#### Git Workflow
- **Comprehensive .gitignore**: Covers Python, Django, Node.js, IDE files, OS files
- **Environment Variables**: Use `env.example` as template
- **Generated Files**: Properly excluded from version control
- **Media Files**: User uploads and generated files excluded

#### .gitignore Features
The comprehensive .gitignore includes:
- **Python**: `__pycache__/`, `*.pyc`, virtual environments, distribution files
- **Django**: Database files, logs, static files, media files
- **Node.js**: `node_modules/`, npm logs, yarn files
- **IDEs**: VSCode, IntelliJ, Sublime Text, Vim, Emacs
- **OS Files**: `.DS_Store`, `Thumbs.db`, system files
- **Docker**: Volumes, temporary files
- **SSL**: Certificates and keys
- **Generated Files**: Excel outputs, uploads, results
- **Environment**: `.env` files, local configurations
- **Testing**: Coverage reports, pytest cache
- **Documentation**: Build outputs

### Code Quality

#### Linting and Formatting
- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting
- **bandit**: Security linting
- **pre-commit**: Git hooks for quality checks

#### Testing Strategy
- **Unit Tests**: App-specific tests in `src/chatbot/tests/`
- **Integration Tests**: Cross-component tests in `tests/integration/`
- **End-to-End Tests**: Full workflow tests in `tests/e2e/`
- **Fixtures**: Test data in `tests/fixtures/`

## Deployment

### Docker Configuration

#### Services
- **web**: Django application container
- **db**: MySQL 8.0 database
- **nginx**: Web server and reverse proxy
- **certbot**: SSL certificate management (production)

#### Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key
DATABASE_NAME=create_testcase_ai
DATABASE_USER=create_testcase_ai
DATABASE_PASSWORD=Asdf1234#
DATABASE_HOST=db
DATABASE_PORT=3306
```

#### Configuration Files
- **Development**: `docker-compose.yml`
- **Production**: `docker-compose.prod.yml`
- **Dockerfile**: Located in `config/docker/`
- **Nginx**: Configuration in `config/nginx/`

### Production Considerations

#### Nginx Configuration
- **Static File Serving**: Efficient static file delivery
- **SSL Termination**: HTTPS support with Let's Encrypt
- **Load Balancing**: Ready for horizontal scaling

#### Database Optimization
- **Connection Pooling**: Configured for production load
- **Indexing**: Proper database indexes for performance
- **Backup Strategy**: Regular database backups

## Testing Guidelines

### Test Case Structure
Each generated test case includes:
- **ID**: Sequential number
- **Priority**: High/Medium/Low
- **Type**: Functional/Integration/UI/etc.
- **Goal**: Test objective
- **Test Data**: Input data for testing
- **Conditions**: Prerequisites
- **Steps**: Detailed test steps
- **Expected Result**: Expected outcome
- **Notes**: Additional information

### Quality Assurance
- **AI Output Validation**: Parse and validate AI-generated content
- **Excel Format Validation**: Ensure proper Excel file structure
- **Error Handling Testing**: Test all error scenarios
- **Performance Testing**: Load testing for file processing

## Maintenance

### Regular Tasks
- **API Key Rotation**: Update OpenAI API keys
- **Database Cleanup**: Remove old chat history
- **Log Monitoring**: Monitor application logs
- **Performance Monitoring**: Track response times

### Troubleshooting

#### Common Issues
1. **OpenAI API Errors**: Check API key and rate limits
2. **File Upload Failures**: Verify file format and size
3. **Database Connection**: Check MySQL service status
4. **Static File Issues**: Run `collectstatic` command

#### Debug Tools
- **Django Debug Toolbar**: Development debugging
- **Log Files**: Application and error logs
- **Database Queries**: Monitor query performance

## Future Enhancements

### Planned Features
- **User Authentication**: User accounts and permissions
- **Template Customization**: Custom test case templates
- **Batch Processing**: Improved multi-file processing
- **API Integration**: REST API for external integrations
- **Advanced AI Models**: Support for newer AI models

### Scalability Considerations
- **Horizontal Scaling**: Multiple Django instances
- **Database Sharding**: Partition large datasets
- **Caching**: Redis for session and data caching
- **CDN**: Content delivery for static files

---

## Quick Start for New Agents

### 1. Project Setup
```bash
# Clone and setup
git clone <repository-url>
cd testcase-generator

# Copy environment variables
cp env.example .env
# Edit .env with your OpenAI API key

# Start development environment
make dev
```

### 2. Understanding the Core Flow
**User Input** → **AI Processing** → **Excel Generation** → **Database Storage**

### 3. Key Files to Focus On
- **`src/chatbot/views.py`** - Main business logic and API endpoints
- **`src/static/js/handle.js`** - Frontend interactions and UI management
- **`src/chatbot/upload.py`** - File upload and processing logic
- **`src/chatbot/template.py`** - Template generation functionality
- **`src/chatbot/models.py`** - Database models and relationships
- **`src/testcase_generator/settings/`** - Environment-specific configurations

### 4. Development Workflow
```bash
# Start development
make dev

# Run tests
make test

# Check code quality
make lint
make format

# Database operations
make migrate
make createsuperuser
```

### 5. Common Tasks
- **Adding new AI prompts**: Modify prompt strings in `views.py` and `upload.py`
- **Modifying Excel output format**: Update `upload.py` and `template.py`
- **Adding new file validation rules**: Extend validation functions in `upload.py`
- **Enhancing UI components**: Modify templates and JavaScript files
- **Adding new API endpoints**: Update `urls.py` and create new views

### 6. Testing Strategy
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **File Testing**: Always test with real Excel files and various input scenarios

### 7. Error Handling
- Implement comprehensive error handling for all new features
- Use proper HTTP status codes
- Provide user-friendly error messages
- Log errors for debugging

### 8. Code Quality Standards
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write comprehensive docstrings
- Maintain test coverage above 80%

### 9. Environment Management
- **Development**: Use `requirements/development.txt`
- **Production**: Use `requirements/production.txt`
- **Testing**: Use `requirements/testing.txt`

### 10. Git Workflow
- Use feature branches for new development
- Write descriptive commit messages
- Run tests before committing
- Use the comprehensive .gitignore for clean commits

## Project Migration

### Current vs Recommended Structure
The project has been restructured for better organization and maintainability:

#### Key Changes
- **Source Code**: Moved from `app/` to `src/` with clear separation
- **Settings**: Split into environment-specific files
- **Requirements**: Structured dependency management
- **Configuration**: Centralized in `config/` directory
- **Documentation**: Organized in `docs/` and `ai-docs/`
- **Testing**: Comprehensive test structure
- **Tools**: Added Makefile and utility scripts

#### Migration Benefits
- **Better Organization**: Clear separation of concerns
- **Environment Management**: Proper dev/prod/test separation
- **Dependency Management**: Structured requirements
- **Development Workflow**: Improved tooling and commands
- **Team Collaboration**: Clear structure for multiple developers
- **Production Ready**: Proper configuration management

### Migration Guide
For detailed migration instructions, see `ai-docs/project-structure-migration.md`.

This guideline provides a comprehensive understanding of the Testcase Generator AI project structure, functionality, and development practices for effective agent collaboration.
