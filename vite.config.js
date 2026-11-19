import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { activityMiddleware } from './server/activity.js'

function installActivity(server) {
  server.middlewares.use(activityMiddleware({ databasePath: process.env.ACTIVITY_DB }))
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), { name: 'portfolio-activity', configureServer: installActivity, configurePreviewServer: installActivity }],
  base: '/3d_personal_portfolio/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
