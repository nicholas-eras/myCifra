import React from 'react';
import { useTheme } from './ThemeProvider'; // ajuste o caminho se necessário
import { Moon, Sun } from 'lucide-react';
import styles from '../styles/theme-toggle.module.css';

const ThemeToggle = () => {
  const themeContext = useTheme();
  if (!themeContext) throw new Error("ThemeToggle must be used within a ThemeProvider");

  const { theme, toggleTheme } = themeContext;
  const isDark = theme === 'dark';

  return (
    <div className={styles.themeToggle} onClick={toggleTheme}>
      <div className={styles.toggleTrack}>
        <div
          className={styles.toggleThumb}
          style={{ transform: isDark ? 'translateX(31px)' : 'translateX(0)' }}
        />
        <div className={`${styles.icon} ${styles.leftIcon}`}>
          <Moon size={18} className={isDark ? styles.invisible : styles.visible} />
        </div>
        <div className={`${styles.icon} ${styles.rightIcon}`} style={{ color: isDark ? 'black' : 'white' }}>
          <Sun size={18} className={isDark ? styles.visible : styles.invisible} />
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
