
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
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
			},
			screens: {
				'sm': '100%',
				'md': '100%',
				'lg': '100%',
				'xl': '100%',
				'2xl': '100%'
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
				sport: {
					blue: '#007AFF',     /* Electric Blue */
					green: '#32CD32',    /* Lime Green */
					dark: '#1A1A1A',     /* Deep Black */
					orange: '#FF9500',   /* Vibrant Orange */
					red: '#FF3B30',      /* Sports Red */
					purple: '#AF52DE',   /* Dynamic Purple */
					yellow: '#FFCC00'    /* Energy Yellow */
				}
			},
			fontFamily: {
				sans: ['Montserrat', 'sans-serif'],
				display: ['Bebas Neue', 'Raleway', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 122, 255, 0)' },
					'50%': { boxShadow: '0 0 10px 2px rgba(0, 122, 255, 0.4)' },
				},
				'slide-in-bottom': {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				}
			},
			screens: {
				'xs': '480px',
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 1s ease-out',
        'fade-in-up': 'fade-in-up 0.7s ease-out',
        'pulse-soft': 'pulse-soft 3s infinite ease-in-out',
        'bounce-subtle': 'bounce-subtle 2s infinite ease-in-out',
				'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
				'slide-in-bottom': 'slide-in-bottom 0.5s ease-out',
			},
      boxShadow: {
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 15px 30px -5px rgba(0, 0, 0, 0.2)',
        'button': '0 8px 15px -3px rgba(0, 122, 255, 0.5)',
				'sport': '0 15px 25px -5px rgba(0, 122, 255, 0.35)'
      }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
