import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				emerald: {
					100: "#d1fae5",
					200: "#a7f3d0",
					300: "#6ee7b7",
					400: "#34d399",
					500: "#10b981",
					600: "#059669",
				},
				orange: {
					100: "#ffe4b5",
					300: "#fdba74",
					500: "#f97316",
				},
				sky: {
					100: "#e0f2fe",
					300: "#7dd3fc",
					500: "#0ea5e9",
				},
				fuchsia: {
					300: "#e879f9",
					500: "#a21caf",
				},
				blue: {
					100: "#e9f2fe",
					300: "#69a8f7",
					500: "#377cff",
				},
				green: {
					100: "#e8fff2",
					300: "#71e1b2",
					500: "#22c55e",
				},
				purple: {
					100: "#f2e9fa",
					300: "#b98efc",
					500: "#9261ed",
				},
				orange: {
					100: "#fff3e3",
					300: "#ffc063",
					500: "#ff9346",
				},
				gray: {
					100: "#f6f9fb",
					300: "#e4e7ef",
					500: "#a0aec0",
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			gradientColorStops: theme => ({
				...theme('colors'),
			}),
			boxShadow: {
				'soft': '0 6px 28px 0 rgba(80, 120, 200, 0.08)',
				'card': '0 1px 6px 0 rgba(60,80,120,0.06)',
				'hover': '0 2px 20px 0 rgba(34,197,94,0.13)', // 绿色烟雾
			},
			animation: {
				'fade-in': 'fade-in 0.36s cubic-bezier(.32,1.56,.74,.97)',
				'fade-pop': 'scale-in 0.2s, fade-in 0.4s',
				'hover-bounce': 'hover-bounce 0.5s cubic-bezier(.36,.07,.19,.97) both',
				'scale-in': "scale-in 0.20s cubic-bezier(.44,0,0.56,1)"
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: 0, transform: 'translateY(16px)' },
					'100%': { opacity: 1, transform: 'translateY(0)' },
				},
				'scale-in': {
					'0%': { transform: "scale(.95)", opacity: 0 },
					'100%': { transform: "scale(1)", opacity: 1 },
				},
				'hover-bounce': {
					'0%, 100%': { transform: "translateY(0)" },
					'50%': { transform: "translateY(-5px)" },
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			borderRadius: {
				lg: "1rem",
				xl: "1.25rem",
			},
			fontFamily: {
				sans: ['"Inter"', 'system-ui', "sans-serif"],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
