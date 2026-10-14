# Tu Nueva Vida

Voy a integrar Claude de Anthropic mediante una Supabase Edge Function.

Necesito que prepares la integración de forma segura:

- La llamada a Anthropic debe ejecutarse únicamente en backend.

- No expongas la clave en el frontend.

- Utiliza un secreto llamado ANTHROPIC_API_KEY.

- No uses una variable VITE_ para esta clave.

- Todavía no construyas la interfaz completa del chat.

- Primero crea la estructura backend y dime cuándo debo introducir el secreto.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/041dd47a-f776-48d5-8115-cf6caede3d76).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
