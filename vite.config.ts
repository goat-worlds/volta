import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        // Le serveur écoute sur toutes les interfaces pour être ouvert depuis
        // un téléphone sur le même réseau. Le navigateur envoie alors
        // « Origin: http://192.168.x.x:3000 », que le proxy transmettait tel
        // quel : l'API, qui n'autorise que localhost, répondait 403 « Invalid
        // CORS request » à tout — connexion comprise — et le backend passait
        // pour en panne.
        //
        // Vu du navigateur, l'appel est pourtant de même origine : il part
        // vers ce serveur-ci, qui le relaie. L'en-tête est donc retiré avant
        // relais, et l'API voit une requête ordinaire. La liste d'origines du
        // backend reste stricte, comme elle doit l'être en production où le
        // site est servi sans ce proxy.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin')
          })
        },
      },
    },
  },
})
