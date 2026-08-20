Write-Host "
🚀 CYBERAS Intelligence - Mode Développement
=============================================
" -ForegroundColor Green

Write-Host "⏳ Démarrage de Quarkus Backend..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-NoExit -Command cd 'c:\Users\DELL PRECISION 5550\CYBERAS-MAIN'; .\mvnw quarkus:dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "⏳ Démarrage de React Frontend..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-NoExit -Command cd 'c:\Users\DELL PRECISION 5550\CYBERAS-MAIN\frontend'; npm run dev" -WindowStyle Normal

Write-Host "
✅ Les deux services sont en cours de démarrage...

📱 Frontend: http://localhost:5173
🖥️  Backend:  http://localhost:8080
📚 Swagger: http://localhost:8080/q/swagger-ui/
🔧 Dev UI:  http://localhost:8080/q/dev/

Appuyez sur Ctrl+C pour arrêter (dans chaque terminal)
" -ForegroundColor Yellow

Read-Host "Appuyez sur Entrée pour fermer cette fenêtre"
