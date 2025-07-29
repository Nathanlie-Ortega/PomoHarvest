# PomoHarvest 🍅

A modern Pomodoro Timer application built with React, designed to boost productivity through the Pomodoro Technique. PomoHarvest helps you manage your time effectively by breaking work into focused intervals with short breaks.

## Live Demo

Visit the live application: [https://pomo-harvest.vercel.app/](https://pomo-harvest.vercel.app/)

## Features

- **Pomodoro Timer**: Classic customizable work sessions and breaks
- **Task Management**: Track your daily productivity goals
- **Progress Analytics**: Visualize your productivity patterns with charts
- **Sound Notifications**: Audio alerts for session transitions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## 🛠️ Technologies Used

- **React 18** - Frontend framework
- **React Router DOM** - Navigation and routing
- **Firebase** - Backend services and authentication
- **Recharts** - Data visualization and analytics
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Styling and responsive design
- **Headless UI** - Accessible UI components

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:
- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nathanlie-Ortega/PomoHarvest.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd PomoHarvest
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Install React dependencies (only if needed)**
   ```bash
   npm install react@^18.2.0 react-dom@^18.2.0
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   
   The application will automatically open at [http://localhost:3000](http://localhost:3000)

### Environment Variables

**Note**: The `.env` file containing Firebase configuration and other environment variables is not included in this repository for security reasons. The environment variables are managed by the project owner.

If you're forking this project, you'll need to create your own `.env` file with the following variables:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config variables
```

## Available Scripts

In the project directory, you can run:

- **`npm start`** - Runs the app in development mode
- **`npm run build`** - Builds the app for production
- **`npm test`** - Launches the test runner
- **`npm run eject`** - Ejects from Create React App

## Troubleshooting

### Common Issues

**Issue**: `'react-scripts' is not recognized as an internal or external command`

**Solution**: 
```bash
npm install react@^18.2.0 react-dom@^18.2.0
npm start
```

**Issue**: Module not found errors

**Solution**: Clear cache and reinstall dependencies
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
# or on Windows PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall dependencies
npm install
```

**Important**: Avoid using `npm audit fix --force` as it may break React Scripts compatibility.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.


© 2025 PomoHarvest. All rights reserved.


Permission is hereby granted, free of charge, to any person obtaining a copy of this software to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.


## Author

**Nathanlie Ortega**
- GitHub: [@Nathanlie-Ortega](https://github.com/Nathanlie-Ortega)

## Acknowledgments

- Inspired by the Pomodoro Technique developed by Francesco Cirillo
- Icons and design elements from Heroicons and Headless UI