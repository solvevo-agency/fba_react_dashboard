import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router/router';
import { ReduxProvider } from '@/app/providers/ReduxProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { ToasterProvider } from '@/app/providers/ToasterProvider';

export default function App() {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <ToasterProvider />
      </ThemeProvider>
    </ReduxProvider>
  );
}

