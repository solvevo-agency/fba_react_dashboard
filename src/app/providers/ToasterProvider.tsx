import { Toaster } from 'sonner';
import { useTheme } from './ThemeProvider';

export function ToasterProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      duration={3500}
    />
  );
}

