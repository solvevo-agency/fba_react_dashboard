import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="space-y-4 max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary font-bold text-3xl font-secondary">
          404
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page Not Found
        </h1>
        <p className="text-sm text-muted-foreground">
          The administration view you are trying to access does not exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" asChild size="sm">
            <Link to={-1 as unknown as string}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

