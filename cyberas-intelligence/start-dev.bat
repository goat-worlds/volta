@echo off
echo.
echo 🚀 CYBERAS Intelligence - Mode Développement
echo =====================================
echo.

REM Démarrer deux terminals PowerShell en parallèle

echo ⏳ Démarrage de Quarkus Backend (Terminal 1)...
start "Quarkus Backend" powershell -Command "cd 'c:\Users\DELL PRECISION 5550\CYBERAS-MAIN'; .\mvnw quarkus:dev"

timeout /t 3

echo ⏳ Démarrage de React Frontend (Terminal 2)...
start "React Frontend" powershell -Command "cd 'c:\Users\DELL PRECISION 5550\CYBERAS-MAIN\frontend'; npm run dev"

echo.
echo ✅ Les deux services sont en cours de démarrage...
echo.
echo 📱 Frontend: http://localhost:5173
echo 🖥️  Backend:  http://localhost:8080
echo 📚 Swagger: http://localhost:8080/q/swagger-ui/
echo 🔧 Dev UI:  http://localhost:8080/q/dev/
echo.
echo Appuyez sur Ctrl+C pour arrêter (dans chaque terminal)
echo.
pause
