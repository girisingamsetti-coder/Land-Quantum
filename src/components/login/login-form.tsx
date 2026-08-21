'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Eye, EyeOff, Atom, UserCircle } from 'lucide-react'

const DEMO_ACCOUNTS = [
  {
    label: 'Super Admin',
    description: 'R. Venkateshwara Rao · Commissioner',
    email: 'admin@amaravati-demo.gov.in',
    password: 'Admin@12345',
  },
  {
    label: 'Lands Officer',
    description: 'S. Lakshmi Devi · Deputy Commissioner',
    email: 'lands@amaravati-demo.gov.in',
    password: 'Admin@12345',
  },
  {
    label: 'Technical Reviewer',
    description: 'M. Suresh Babu · Chief Engineer',
    email: 'technical@amaravati-demo.gov.in',
    password: 'Admin@12345',
  },
  {
    label: 'Finance Officer',
    description: 'K. Padmavathi · Finance Controller',
    email: 'finance@amaravati-demo.gov.in',
    password: 'Admin@12345',
  },
  {
    label: 'Monitoring Officer',
    description: 'P. Ravi Kumar · Director',
    email: 'monitoring@amaravati-demo.gov.in',
    password: 'Admin@12345',
  },
  {
    label: 'Grievance Officer',
    description: 'A. Nagendra · Grievance Officer',
    email: 'grievance@amaravati-demo.gov.in',
    password: 'Admin@12345',
  },
  {
    label: 'Investor',
    description: 'D. Ramachandra Reddy · Director',
    email: 'investor@amaravati-demo.in',
    password: 'Admin@12345',
  },
] as const

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')

  const handleRoleSelect = (value: string) => {
    setSelectedRole(value)
    const account = DEMO_ACCOUNTS.find((a) => a.label === value)
    if (account) {
      setEmail(account.email)
      setPassword(account.password)
      clearError()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <Atom className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Land Quantum</h1>
            <p className="text-sm text-muted-foreground mt-1">Land Allotment & Development Management</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg shadow-slate-200/50 border-slate-200/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in to your account</CardTitle>
            <CardDescription>Select a demo role or enter credentials manually</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Demo Role Selector */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <UserCircle className="h-3.5 w-3.5" />
                  Demo Account
                </Label>
                <Select value={selectedRole} onValueChange={handleRoleSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role to auto-fill credentials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Internal Officers</SelectLabel>
                      {DEMO_ACCOUNTS.slice(0, 6).map((account) => (
                        <SelectItem key={account.label} value={account.label}>
                          <span className="font-medium">{account.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {account.description}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>External</SelectLabel>
                      {DEMO_ACCOUNTS.slice(6).map((account) => (
                        <SelectItem key={account.label} value={account.label}>
                          <span className="font-medium">{account.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {account.description}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@amaravati-demo.gov.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setSelectedRole('')
                    clearError()
                  }}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setSelectedRole('')
                      clearError()
                    }}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
 Demo environment — No real data is stored or transmitted
        </p>
      </div>
    </div>
  )
}
