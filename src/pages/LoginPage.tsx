import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/features/auth/authValidation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { loginUser, clearAuthError } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearAuthError());
    const resultAction = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(resultAction)) {
      const user = resultAction.payload.user;
      const greetingName = user.name || user.first_name || 'Super Admin';
      toast.success(`Welcome back, ${greetingName}!`);
      navigate('/dashboard', { replace: true });
    } else if (loginUser.rejected.match(resultAction)) {
      const errorMsg = resultAction.payload || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset is managed by system administrator.');
  };

  const fillDemoCredentials = () => {
    setValue('email', 'admin@gmail.com');
    setValue('password', 'Admin123456789');
    toast.info('Demo credentials filled');
  };

  return (
    <div className="w-full max-w-md animate-in fade-in-50 zoom-in-95 duration-200">
      <Card className="border shadow-lg">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-8 ring-primary/5">
            <img src="/logo.png" alt="FBA Logo" className="h-9 w-9 object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Super Admin Login</CardTitle>
            <CardDescription className="text-sm mt-1">
              Enter your credentials to access the FBA administration portal
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@gmail.com"
                  className="pl-9"
                  disabled={isLoading}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-primary hover:text-primary-hover hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  disabled={isLoading}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue('rememberMe', Boolean(checked))}
                disabled={isLoading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-xs font-normal text-muted-foreground cursor-pointer select-none"
              >
                Keep me signed in on this device
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-2 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>

          {/* Seed Credentials Helper */}
          <div
            onClick={fillDemoCredentials}
            className="mt-6 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground border cursor-pointer hover:bg-muted/80 transition-colors"
            title="Click to auto-fill seeded credentials"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Super Admin Seed:</span>
              <span className="text-[10px] text-primary underline">Click to fill</span>
            </div>
            <div className="mt-1 flex items-center justify-between font-mono">
              <span>admin@gmail.com</span>
              <span>Admin123456789</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
