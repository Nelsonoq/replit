// import { google } from "googleapis";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const CREDENTIALS_PATH = path.join(__dirname, "..", "google-credentials.json");
// const TOKEN_PATH = path.join(__dirname, "..", "google-token.json");
// const SHEET_ID_FILE = path.join(__dirname, "..", "data", "sheet-id.json");

// // Criar pasta data se não existir
// const dataDir = path.join(__dirname, "..", "data");
// if (!fs.existsSync(dataDir)) {
//   fs.mkdirSync(dataDir, { recursive: true });
// }

// // Criar sheet-id.json se não existir
// if (!fs.existsSync(SHEET_ID_FILE)) {
//   fs.writeFileSync(SHEET_ID_FILE, JSON.stringify({}, null, 2));
// }

// // Verificar se as credenciais existem
// if (!fs.existsSync(CREDENTIALS_PATH)) {
//   console.error("❌ Google credentials file not found!");
//   console.error("Please create google-credentials.json in the root directory");
// }

// // Autenticar com Google usando Service Account
// function getAuthClient() {
//   try {
//     const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));

//     const auth = new google.auth.GoogleAuth({
//       credentials,
//       scopes: [
//         "https://www.googleapis.com/auth/spreadsheets",
//         "https://www.googleapis.com/auth/drive.file",
//       ],
//     });

//     return auth;
//   } catch (err) {
//     console.error("❌ Error creating auth client:", err);
//     throw err;
//   }
// }

// // Obter Sheet ID guardado
// function getSavedSheetId(guildId) {
//   try {
//     if (!fs.existsSync(SHEET_ID_FILE)) {
//       return null;
//     }

//     const data = fs.readFileSync(SHEET_ID_FILE, "utf-8");

//     if (!data || data.trim() === "") {
//       console.log("⚠️ sheet-id.json is empty, initializing...");
//       fs.writeFileSync(SHEET_ID_FILE, JSON.stringify({}, null, 2));
//       return null;
//     }

//     const sheetIds = JSON.parse(data);
//     return sheetIds[guildId] || null;
//   } catch (err) {
//     console.error("❌ Error reading sheet-id.json:", err);
//     fs.writeFileSync(SHEET_ID_FILE, JSON.stringify({}, null, 2));
//     return null;
//   }
// }

// // Guardar Sheet ID
// function saveSheetId(guildId, sheetId) {
//   try {
//     let data = {};

//     if (fs.existsSync(SHEET_ID_FILE)) {
//       const fileContent = fs.readFileSync(SHEET_ID_FILE, "utf-8");
//       if (fileContent && fileContent.trim() !== "") {
//         data = JSON.parse(fileContent);
//       }
//     }

//     data[guildId] = sheetId;
//     fs.writeFileSync(SHEET_ID_FILE, JSON.stringify(data, null, 2));
//   } catch (err) {
//     console.error("❌ Error saving sheet-id.json:", err);
//   }
// }

// // Criar Google Sheet para uma guild
// export async function createTournamentSheet(guildId, guildName) {
//   try {
//     const auth = await getAuthClient();
//     const sheets = google.sheets({ version: "v4", auth });
//     const drive = google.drive({ version: "v3", auth });

//     console.log("📝 Creating Google Sheet...");

//     // Criar nova spreadsheet
//     const spreadsheet = await sheets.spreadsheets.create({
//       requestBody: {
//         properties: {
//           title: `🏆 Tournament System - ${guildName}`,
//         },
//         sheets: [
//           {
//             properties: {
//               title: "Overview",
//               gridProperties: {
//                 frozenRowCount: 1,
//               },
//             },
//           },
//         ],
//       },
//     });

//     const spreadsheetId = spreadsheet.data.spreadsheetId;
//     console.log(`✅ Spreadsheet created: ${spreadsheetId}`);

//     // Configurar Overview
//     await sheets.spreadsheets.batchUpdate({
//       spreadsheetId,
//       requestBody: {
//         requests: [
//           {
//             updateCells: {
//               range: {
//                 sheetId: 0,
//                 startRowIndex: 0,
//                 endRowIndex: 1,
//                 startColumnIndex: 0,
//                 endColumnIndex: 5,
//               },
//               rows: [
//                 {
//                   values: [
//                     {
//                       userEnteredValue: {
//                         stringValue: `🏆 Tournament System - ${guildName}`,
//                       },
//                       userEnteredFormat: {
//                         backgroundColor: { red: 0.0, green: 0.44, blue: 0.75 },
//                         textFormat: {
//                           foregroundColor: { red: 1, green: 1, blue: 1 },
//                           fontSize: 16,
//                           bold: true,
//                         },
//                         horizontalAlignment: "CENTER",
//                       },
//                     },
//                   ],
//                 },
//               ],
//               fields: "userEnteredValue,userEnteredFormat",
//             },
//           },
//           {
//             mergeCells: {
//               range: {
//                 sheetId: 0,
//                 startRowIndex: 0,
//                 endRowIndex: 1,
//                 startColumnIndex: 0,
//                 endColumnIndex: 5,
//               },
//               mergeType: "MERGE_ALL",
//             },
//           },
//         ],
//       },
//     });

//     console.log("🎨 Sheet formatted");

//     // Tornar público (qualquer pessoa com link pode ver)
//     try {
//       await drive.permissions.create({
//         fileId: spreadsheetId,
//         requestBody: {
//           role: "reader",
//           type: "anyone",
//         },
//       });
//       console.log("🌐 Sheet made public");
//     } catch (err) {
//       console.warn("⚠️ Could not make sheet public:", err.message);
//       // Continua mesmo se não conseguir tornar público
//     }

//     // Guardar ID
//     saveSheetId(guildId, spreadsheetId);

//     const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
//     console.log(`✅ Google Sheet created successfully: ${url}`);

//     return { spreadsheetId, url };
//   } catch (err) {
//     console.error("❌ Error creating Google Sheet:", err.message);
//     if (err.response) {
//       console.error("Response data:", err.response.data);
//     }
//     throw err;
//   }
// }

// // Obter ou criar sheet
// export async function getOrCreateSheet(guildId, guildName) {
//   const existingId = getSavedSheetId(guildId);

//   if (existingId) {
//     const url = `https://docs.google.com/spreadsheets/d/${existingId}`;
//     console.log(`📊 Using existing sheet: ${url}`);
//     return { spreadsheetId: existingId, url, existed: true };
//   }

//   console.log("🆕 No existing sheet found, creating new one...");
//   const result = await createTournamentSheet(guildId, guildName);
//   return { ...result, existed: false };
// }

// // Atualizar/Criar tab do torneio
// export async function updateTournamentTab(guildId, guildName, tournament) {
//   try {
//     const { spreadsheetId } = await getOrCreateSheet(guildId, guildName);

//     const auth = await getAuthClient();
//     const sheets = google.sheets({ version: "v4", auth });

//     const sheetName = tournament.id;

//     // Verificar se tab já existe
//     const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
//     const existingSheet = spreadsheet.data.sheets.find(
//       (s) => s.properties.title === sheetName,
//     );

//     let sheetId;

//     if (existingSheet) {
//       sheetId = existingSheet.properties.sheetId;
//       await sheets.spreadsheets.values.clear({
//         spreadsheetId,
//         range: `${sheetName}!A1:Z1000`,
//       });
//     } else {
//       const response = await sheets.spreadsheets.batchUpdate({
//         spreadsheetId,
//         requestBody: {
//           requests: [
//             {
//               addSheet: {
//                 properties: {
//                   title: sheetName,
//                   gridProperties: {
//                     frozenRowCount: 1,
//                   },
//                 },
//               },
//             },
//           ],
//         },
//       });
//       sheetId = response.data.replies[0].addSheet.properties.sheetId;
//     }

//     // Preparar dados
//     const typeNames = {
//       single_elimination: "Single Elimination",
//       double_elimination: "Double Elimination",
//       round_robin: "Round Robin",
//       swiss: "Swiss",
//     };

//     const statusNames = {
//       registration_open: "🟢 Registration Open",
//       registration_closed: "🟡 Registration Closed",
//       in_progress: "🔵 In Progress",
//       completed: "⚫ Completed",
//     };

//     const values = [
//       [`🏆 ${tournament.name}`],
//       [],
//       [
//         "Tournament ID:",
//         tournament.id,
//         "",
//         "Type:",
//         typeNames[tournament.type] || tournament.type,
//       ],
//       [
//         "Status:",
//         statusNames[tournament.status] || tournament.status,
//         "",
//         "Max Players:",
//         tournament.maxPlayers || "Unlimited",
//       ],
//       [
//         "Registered Players:",
//         tournament.players.length,
//         "",
//         "Created At:",
//         new Date(tournament.createdAt).toLocaleString("en-GB"),
//       ],
//       ["Description:", tournament.description || "No description"],
//       [],
//       ["👥 REGISTERED PLAYERS"],
//       ["#", "User ID", "Username", "Registered At", "Status"],
//     ];

//     if (tournament.players.length > 0) {
//       tournament.players.forEach((player, index) => {
//         values.push([
//           index + 1,
//           player.userId,
//           player.username,
//           new Date(player.registeredAt).toLocaleString("en-GB"),
//           "✅ Active",
//         ]);
//       });
//     } else {
//       values.push(["No players registered yet"]);
//     }

//     values.push([]);
//     values.push([`📅 Last Updated: ${new Date().toLocaleString("en-GB")}`]);

//     await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range: `${sheetName}!A1`,
//       valueInputOption: "RAW",
//       requestBody: {
//         values,
//       },
//     });

//     // Aplicar formatação (simplificada)
//     const requests = [
//       {
//         mergeCells: {
//           range: {
//             sheetId,
//             startRowIndex: 0,
//             endRowIndex: 1,
//             startColumnIndex: 0,
//             endColumnIndex: 5,
//           },
//           mergeType: "MERGE_ALL",
//         },
//       },
//       {
//         repeatCell: {
//           range: {
//             sheetId,
//             startRowIndex: 0,
//             endRowIndex: 1,
//           },
//           cell: {
//             userEnteredFormat: {
//               backgroundColor: { red: 0.0, green: 0.44, blue: 0.75 },
//               textFormat: {
//                 foregroundColor: { red: 1, green: 1, blue: 1 },
//                 fontSize: 18,
//                 bold: true,
//               },
//               horizontalAlignment: "CENTER",
//             },
//           },
//           fields: "userEnteredFormat",
//         },
//       },
//     ];

//     await sheets.spreadsheets.batchUpdate({
//       spreadsheetId,
//       requestBody: { requests },
//     });

//     const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
//     console.log(`✅ Tournament tab updated: ${tournament.id}`);

//     return { spreadsheetId, url };
//   } catch (err) {
//     console.error("❌ Error updating tournament tab:", err.message);
//     throw err;
//   }
// }

// // Remover tab do torneio
// export async function removeTournamentTab(guildId, tournamentId) {
//   try {
//     const spreadsheetId = getSavedSheetId(guildId);
//     if (!spreadsheetId) return;

//     const auth = await getAuthClient();
//     const sheets = google.sheets({ version: "v4", auth });

//     const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
//     const sheet = spreadsheet.data.sheets.find(
//       (s) => s.properties.title === tournamentId,
//     );

//     if (sheet) {
//       await sheets.spreadsheets.batchUpdate({
//         spreadsheetId,
//         requestBody: {
//           requests: [
//             {
//               deleteSheet: {
//                 sheetId: sheet.properties.sheetId,
//               },
//             },
//           ],
//         },
//       });
//       console.log(`🗑️ Tournament tab removed: ${tournamentId}`);
//     }
//   } catch (err) {
//     console.error("❌ Error removing tournament tab:", err.message);
//   }
// }

// // Obter URL da sheet
// export async function getSheetUrl(guildId, guildName) {
//   const { url, existed } = await getOrCreateSheet(guildId, guildName);
//   return { url, existed };
// }
