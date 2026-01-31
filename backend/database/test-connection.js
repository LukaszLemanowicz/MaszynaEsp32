const { db, query, close } = require('./db');

async function testConnection() {
  try {
    console.log('🔍 Testowanie połączenia z bazą danych SQLite...');

    // Test podstawowego połączenia
    const result = await query('SELECT datetime("now") as current_time, sqlite_version() as sqlite_version');
    console.log('✅ Połączenie działa!');
    console.log(`⏰ Czas serwera: ${result.rows[0].current_time}`);
    console.log(`📦 Wersja SQLite: ${result.rows[0].sqlite_version}`);

    // Sprawdź czy tabele istnieją
    const tablesResult = await query(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    console.log('\n📋 Dostępne tabele:');
    if (!tablesResult.rows || tablesResult.rows.length === 0) {
      console.log('⚠️  Brak tabel w bazie danych. Tabele powinny być utworzone automatycznie przy starcie aplikacji.');
    } else {
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.name}`);
      });
    }

    // Sprawdź czy wymagane tabele istnieją
    const requiredTables = ['users', 'sessions', 'devices'];
    const existingTables = tablesResult.rows ? tablesResult.rows.map((r) => r.name) : [];
    const missingTables = requiredTables.filter((t) => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log('\n⚠️  Brakujące tabele:');
      missingTables.forEach((table) => {
        console.log(`   - ${table}`);
      });
      console.log('\n💡 Uruchom aplikację (npm start) - tabele zostaną utworzone automatycznie');
    } else {
      console.log('\n✅ Wszystkie wymagane tabele istnieją!');
    }

    // Sprawdź liczbę rekordów w tabelach
    console.log('\n📊 Statystyki:');
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const sessionCount = await query('SELECT COUNT(*) as count FROM sessions');
    const deviceCount = await query('SELECT COUNT(*) as count FROM devices');
    
    console.log(`   - Użytkownicy: ${userCount.rows[0].count}`);
    console.log(`   - Sesje: ${sessionCount.rows[0].count}`);
    console.log(`   - Urządzenia: ${deviceCount.rows[0].count}`);

    await close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd połączenia z bazą danych:');
    console.error(`   ${error.message}`);
    console.error('\n💡 Sprawdź czy plik bazy danych istnieje i ma odpowiednie uprawnienia');
    await close();
    process.exit(1);
  }
}

testConnection();
