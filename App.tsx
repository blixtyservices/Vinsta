import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, ThemeContext } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <ThemeContext.Consumer>
            {({ theme, isDarkMode }) => (
              <>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={theme.background}
                />
                <AppNavigator />
              </>
            )}
          </ThemeContext.Consumer>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
