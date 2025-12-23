const path = require('path');
const dotenv = require('dotenv');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { optimizeImage } = require('./.squooshrc');
const HtmlWebpackPlugin = require("html-webpack-plugin");

dotenv.config();

const mode = process.env.NODE_ENV;
const srcRelativePath = process.env.WEBPACK_SRC_RELATIVE_PATH || 'src';
const distRelativePath = process.env.WEBPACK_DIST_RELATIVE_PATH || 'dist';
const config = {
    mode: mode,
    entry: {
        'app': './src/assets/stylesheets/app.css',
        //'2023_0508_1113/app_2023_0508_1113': './src/assets/scripts/app_2023_0508_1113.js',
        //'2023_0513_1248/app_2023_0513_1248': './src/assets/scripts/app_2023_0513_1248.js',
        //'2023_1223_1142/app_2023_1223_1142': './src/assets/scripts/app_2023_1223_1142.js',
        //'2023_0509_1227/app_2023_0509_1227': './src/assets/scripts/app_2023_0509_1227.js',
        //'2024_0324_1206/app_2024_0324_1206': './src/assets/scripts/app_2024_0324_1206.js',
        //'2024_0504_1101/app_2024_0504_1101': './src/assets/scripts/app_2024_0504_1101.js',
        //'2024_0622_1338/app_2024_0622_1338': './src/assets/scripts/app_2024_0622_1338.js',
        //'2024_0622_1353/app_2024_0622_1353': './src/assets/scripts/app_2024_0622_1353.js',
        //'2024_0713_1447/app_2024_0713_1447': './src/assets/scripts/app_2024_0713_1447.js',
        //'2023_1125_1219/app_2023_1125_1219': './src/assets/scripts/app_2023_1125_1219.js',
        //'2024_1207_1404/app_2024_1207_1404': './src/assets/scripts/app_2024_1207_1404.js',
        //'2024_0413_1248/app_2024_0413_1248': './src/assets/scripts/app_2024_0413_1248.js',
        //'2024_1026_1244/app_2024_1026_1244': './src/assets/scripts/app_2024_1026_1244.js',
        //'2024_0420_1243/app_2024_0420_1243': './src/assets/scripts/app_2024_0420_1243.js',
        //'2023_0514_1337/app_2023_0514_1337': './src/assets/scripts/app_2023_0514_1337.js',
        //'2025_0809_1123/app_2025_0809_1123': './src/assets/scripts/app_2025_0809_1123.js',
       
        //'2023_0508_1057/app_2023_0508_1057': './src/assets/scripts/app_2023_0508_1057.js',
        //'2023_0514_1414/app_2023_0514_1414': './src/assets/scripts/app_2023_0514_1414.js',
        //'2023_0520_1214/app_2023_0520_1214': './src/assets/scripts/app_2023_0520_1214.js',
        //'2023_0520_1301/app_2023_0520_1301': './src/assets/scripts/app_2023_0520_1301.js',
        //'2023_0520_1307/app_2023_0520_1307': './src/assets/scripts/app_2023_0520_1307.js',
        //'2023_0520_1341/app_2023_0520_1341': './src/assets/scripts/app_2023_0520_1341.js',
        //'2023_0521_1243/app_2023_0521_1243': './src/assets/scripts/app_2023_0521_1243.js',
        //'2023_0526_1102/app_2023_0526_1102': './src/assets/scripts/app_2023_0526_1102.js',
        //'2023_0527_1247/app_2023_0527_1247': './src/assets/scripts/app_2023_0527_1247.js',
        //'2023_0527_1253/app_2023_0527_1253': './src/assets/scripts/app_2023_0527_1253.js',
        //'2023_0528_1317/app_2023_0528_1317': './src/assets/scripts/app_2023_0528_1317.js',
        //'2023_0607_1301/app_2023_0607_1301': './src/assets/scripts/app_2023_0607_1301.js',
        //'2023_0608_1223/app_2023_0608_1223': './src/assets/scripts/app_2023_0608_1223.js',
        //'2023_0610_1352/app_2023_0610_1352': './src/assets/scripts/app_2023_0610_1352.js',
        //'2023_0610_1436/app_2023_0610_1436': './src/assets/scripts/app_2023_0610_1436.js',        
        //'2023_0613_1158/app_2023_0613_1158': './src/assets/scripts/app_2023_0613_1158.js',        
        //'2023_0613_1200/app_2023_0613_1200': './src/assets/scripts/app_2023_0613_1200.js',        
        //'2023_0617_1216/app_2023_0617_1216': './src/assets/scripts/app_2023_0617_1216.js',        
        //'2023_0617_1224/app_2023_0617_1224': './src/assets/scripts/app_2023_0617_1224.js',        
        //'2023_0624_1345/app_2023_0624_1345': './src/assets/scripts/app_2023_0624_1345.js',        
        //'2023_0629_1150/app_2023_0629_1150': './src/assets/scripts/app_2023_0629_1150.js',        
        //'2023_0715_1307/app_2023_0715_1307': './src/assets/scripts/app_2023_0715_1307.js',        
        //'2023_0722_1254/app_2023_0722_1254': './src/assets/scripts/app_2023_0722_1254.js',        
        //'2023_0722_1318/app_2023_0722_1318': './src/assets/scripts/app_2023_0722_1318.js',        
        //'2023_0812_1337/app_2023_0812_1337': './src/assets/scripts/app_2023_0812_1337.js',        
        //'2023_0819_1325/app_2023_0819_1325': './src/assets/scripts/app_2023_0819_1325.js',        
        //'2023_0819_1350/app_2023_0819_1350': './src/assets/scripts/app_2023_0819_1350.js',        
        //'2023_0909_1252/app_2023_0909_1252': './src/assets/scripts/app_2023_0909_1252.js',        
        //'2023_0909_1255/app_2023_0909_1255': './src/assets/scripts/app_2023_0909_1255.js',        
        //'2023_0923_1316/app_2023_0923_1316': './src/assets/scripts/app_2023_0923_1316.js',        
        //'2023_1014_1229/app_2023_1014_1229': './src/assets/scripts/app_2023_1014_1229.js',        
        //'2023_1021_1021/app_2023_1021_1021': './src/assets/scripts/app_2023_1021_1021.js',        
        //'2023_1111_1227/app_2023_1111_1227': './src/assets/scripts/app_2023_1111_1227.js',        
        //'2023_1125_1218/app_2023_1125_1218': './src/assets/scripts/app_2023_1125_1218.js',        
        //'2023_1209_1112/app_2023_1209_1112': './src/assets/scripts/app_2023_1209_1112.js',        
        //'2023_1216_1148/app_2023_1216_1148': './src/assets/scripts/app_2023_1216_1148.js',        
        //'2023_1223_1212/app_2023_1223_1212': './src/assets/scripts/app_2023_1223_1212.js',        
        //'2023_1230_1142/app_2023_1230_1142': './src/assets/scripts/app_2023_1230_1142.js',        
        //'2024_0106_1402/app_2024_0106_1402': './src/assets/scripts/app_2024_0106_1402.js',        
        //'2024_0106_1408/app_2024_0106_1408': './src/assets/scripts/app_2024_0106_1408.js',        
        //'2024_0127_1314/app_2024_0127_1314': './src/assets/scripts/app_2024_0127_1314.js',        
        //'2024_0324_1214/app_2024_0324_1214': './src/assets/scripts/app_2024_0324_1214.js',        
        //'2024_0407_1251/app_2024_0407_1251': './src/assets/scripts/app_2024_0407_1251.js',        
        //'2024_0407_1412/app_2024_0407_1412': './src/assets/scripts/app_2024_0407_1412.js',        
        //'2024_0413_1256/app_2024_0413_1256': './src/assets/scripts/app_2024_0413_1256.js',        
        //'2024_0504_1112/app_2024_0504_1112': './src/assets/scripts/app_2024_0504_1112.js',        
        //'2024_0504_1128/app_2024_0504_1128': './src/assets/scripts/app_2024_0504_1128.js',        
        //'2024_0526_1224/app_2024_0526_1224': './src/assets/scripts/app_2024_0526_1224.js',        
        //'2024_0526_1227/app_2024_0526_1227': './src/assets/scripts/app_2024_0526_1227.js',        
        //'2024_0526_1233/app_2024_0526_1233': './src/assets/scripts/app_2024_0526_1233.js',        
        //'2024_0526_1311/app_2024_0526_1311': './src/assets/scripts/app_2024_0526_1311.js',        
        //'2024_0622_1339/app_2024_0622_1339': './src/assets/scripts/app_2024_0622_1339.js',        
        //'2024_0622_1343/app_2024_0622_1343': './src/assets/scripts/app_2024_0622_1343.js',        
        //'2024_0630_1232/app_2024_0630_1232': './src/assets/scripts/app_2024_0630_1232.js',        
        //'2024_0630_1305/app_2024_0630_1305': './src/assets/scripts/app_2024_0630_1305.js',        
        //'2024_0630_1353/app_2024_0630_1353': './src/assets/scripts/app_2024_0630_1353.js',        
        //'2024_0706_1359/app_2024_0706_1359': './src/assets/scripts/app_2024_0706_1359.js',        
        //'2024_0724_1338/app_2024_0724_1338': './src/assets/scripts/app_2024_0724_1338.js',        
        //'2024_0731_1157/app_2024_0731_1157': './src/assets/scripts/app_2024_0731_1157.js',        
        //'2024_0731_1238/app_2024_0731_1238': './src/assets/scripts/app_2024_0731_1238.js',        
        //'2024_0731_1300/app_2024_0731_1300': './src/assets/scripts/app_2024_0731_1300.js',        
        //'2024_0731_1301/app_2024_0731_1301': './src/assets/scripts/app_2024_0731_1301.js',        
        //'2024_0928_1207/app_2024_0928_1207': './src/assets/scripts/app_2024_0928_1207.js',        
        //'2024_1012_1231/app_2024_1012_1231': './src/assets/scripts/app_2024_1012_1231.js',        
        //'2024_1012_1237/app_2024_1012_1237': './src/assets/scripts/app_2024_1012_1237.js',        
        //'2024_1026_1221/app_2024_1026_1221': './src/assets/scripts/app_2024_1026_1221.js',        
        //'2024_1026_1259/app_2024_1026_1259': './src/assets/scripts/app_2024_1026_1259.js',        
        //'2024_1109_1311/app_2024_1109_1311': './src/assets/scripts/app_2024_1109_1311.js',        
        //'2024_1109_1314/app_2024_1109_1314': './src/assets/scripts/app_2024_1109_1314.js',        
        //'2024_1117_1253/app_2024_1117_1253': './src/assets/scripts/app_2024_1117_1253.js',        
        //'2024_1117_1414/app_2024_1117_1414': './src/assets/scripts/app_2024_1117_1414.js',        
        //'2024_1117_1415/app_2024_1117_1415': './src/assets/scripts/app_2024_1117_1415.js',        
        //'2024_1214_1318/app_2024_1214_1318': './src/assets/scripts/app_2024_1214_1318.js',        
        //'2025_0101_1140/app_2025_0101_1140': './src/assets/scripts/app_2025_0101_1140.js',        
        //'2025_0101_1218/app_2025_0101_1218': './src/assets/scripts/app_2025_0101_1218.js',        
        //'2025_0104_1214/app_2025_0104_1214': './src/assets/scripts/app_2025_0104_1214.js',        
        //'2025_0104_1251/app_2025_0104_1251': './src/assets/scripts/app_2025_0104_1251.js',        
        //'2025_0104_1259/app_2025_0104_1259': './src/assets/scripts/app_2025_0104_1259.js',        
        //'2025_0112_1228/app_2025_0112_1228': './src/assets/scripts/app_2025_0112_1228.js',        
        //'2025_0112_1229/app_2025_0112_1229': './src/assets/scripts/app_2025_0112_1229.js',        
        //'2025_0112_1243/app_2025_0112_1243': './src/assets/scripts/app_2025_0112_1243.js',        
        //'2025_0119_1246/app_2025_0119_1246': './src/assets/scripts/app_2025_0119_1246.js',        
        //'2025_0119_1317/app_2025_0119_1317': './src/assets/scripts/app_2025_0119_1317.js',        
        //'2025_0119_1318/app_2025_0119_1318': './src/assets/scripts/app_2025_0119_1318.js',        
        //'2025_0126_1211/app_2025_0126_1211': './src/assets/scripts/app_2025_0126_1211.js',        
        //'2025_0201_1249/app_2025_0201_1249': './src/assets/scripts/app_2025_0201_1249.js',        
        //'2025_0201_1250/app_2025_0201_1250': './src/assets/scripts/app_2025_0201_1250.js',        
        //'2025_0201_1251/app_2025_0201_1251': './src/assets/scripts/app_2025_0201_1251.js',        
        //'2025_0209_1149/app_2025_0209_1149': './src/assets/scripts/app_2025_0209_1149.js',        
        //'2025_0215_1143/app_2025_0215_1143': './src/assets/scripts/app_2025_0215_1143.js',        
        //'2025_0302_1304/app_2025_0302_1304': './src/assets/scripts/app_2025_0302_1304.js',        
        //'2025_0315_1021/app_2025_0315_1021': './src/assets/scripts/app_2025_0315_1021.js',        
        //'2025_0315_1041/app_2025_0315_1041': './src/assets/scripts/app_2025_0315_1041.js',        
        //'2025_0323_1238/app_2025_0323_1238': './src/assets/scripts/app_2025_0323_1238.js',        
        //'2025_0323_1242/app_2025_0323_1242': './src/assets/scripts/app_2025_0323_1242.js',        
        //'2025_0406_1221/app_2025_0406_1221': './src/assets/scripts/app_2025_0406_1221.js',        
        //'2025_0412_1307/app_2025_0412_1307': './src/assets/scripts/app_2025_0412_1307.js',        
        //'2025_0412_1253/app_2025_0412_1253': './src/assets/scripts/app_2025_0412_1253.js',        
        //'2025_0412_1247/app_2025_0412_1247': './src/assets/scripts/app_2025_0412_1247.js',        
        //'2025_0419_1340/app_2025_0419_1340': './src/assets/scripts/app_2025_0419_1340.js',        
        //'2025_0419_1401/app_2025_0419_1401': './src/assets/scripts/app_2025_0419_1401.js',        
        //'2025_0419_1258/app_2025_0419_1258': './src/assets/scripts/app_2025_0419_1258.js',        
        //'2025_0427_1225/app_2025_0427_1225': './src/assets/scripts/app_2025_0427_1225.js',        
        //'2025_0504_1221/app_2025_0504_1221': './src/assets/scripts/app_2025_0504_1221.js',        
        //'2025_0504_1222/app_2025_0504_1222': './src/assets/scripts/app_2025_0504_1222.js',        
        //'2025_0511_1253/app_2025_0511_1253': './src/assets/scripts/app_2025_0511_1253.js',        
        //'2025_0524_1200/app_2025_0524_1200': './src/assets/scripts/app_2025_0524_1200.js',        
        //'2025_0524_1235/app_2025_0524_1235': './src/assets/scripts/app_2025_0524_1235.js',        
        //'2025_0524_1240/app_2025_0524_1240': './src/assets/scripts/app_2025_0524_1240.js',        
        //'2025_0524_1245/app_2025_0524_1245': './src/assets/scripts/app_2025_0524_1245.js',        
        //'2025_0524_1254/app_2025_0524_1254': './src/assets/scripts/app_2025_0524_1254.js',        
        //'2025_0607_1301/app_2025_0607_1301': './src/assets/scripts/app_2025_0607_1301.js',        
        //'2025_0615_1159/app_2025_0615_1159': './src/assets/scripts/app_2025_0615_1159.js',        
        //'2025_0615_1144/app_2025_0615_1144': './src/assets/scripts/app_2025_0615_1144.js',        
        //'2025_0713_1238/app_2025_0713_1238': './src/assets/scripts/app_2025_0713_1238.js',        
        //'2025_0720_1303/app_2025_0720_1303': './src/assets/scripts/app_2025_0720_1303.js',        
        //'2025_0802_1303/app_2025_0802_1303': './src/assets/scripts/app_2025_0802_1303.js',        
        //'2025_0802_1304/app_2025_0802_1304': './src/assets/scripts/app_2025_0802_1304.js',        
        //'2025_0802_1305/app_2025_0802_1305': './src/assets/scripts/app_2025_0802_1305.js',        
        //'2025_0802_1333/app_2025_0802_1333': './src/assets/scripts/app_2025_0802_1333.js',        
        //'2025_0809_1207/app_2025_0809_1207': './src/assets/scripts/app_2025_0809_1207.js',        
        //'2025_0809_1210/app_2025_0809_1210': './src/assets/scripts/app_2025_0809_1210.js',        
        //'2025_0816_1223/app_2025_0816_1223': './src/assets/scripts/app_2025_0816_1223.js',        
        //'2025_0824_1240/app_2025_0824_1240': './src/assets/scripts/app_2025_0824_1240.js',        
        //'2025_0824_1242/app_2025_0824_1240': './src/assets/scripts/app_2025_0824_1242.js',        
        //'2025_0824_1243/app_2025_0824_1243': './src/assets/scripts/app_2025_0824_1243.js',        
        //'2025_0830_1110/app_2025_0830_1110': './src/assets/scripts/app_2025_0830_1110.js',        
        //'2025_0830_1139/app_2025_0830_1139': './src/assets/scripts/app_2025_0830_1139.js',        
        //'2025_0830_1140/app_2025_0830_1140': './src/assets/scripts/app_2025_0830_1140.js',        
        //'2025_0906_1251/app_2025_0906_1251': './src/assets/scripts/app_2025_0906_1251.js',        
        //'2025_0906_1322/app_2025_0906_1322': './src/assets/scripts/app_2025_0906_1322.js',        
        //'2025_0906_1324/app_2025_0906_1324': './src/assets/scripts/app_2025_0906_1324.js',        
        //'2025_0906_1333/app_2025_0906_1333': './src/assets/scripts/app_2025_0906_1333.js',        
        //'2025_0920_1315/app_2025_0920_1315': './src/assets/scripts/app_2025_0920_1315.js',        
        //'2025_0920_1316/app_2025_0920_1316': './src/assets/scripts/app_2025_0920_1316.js',        
        //'2025_0920_1335/app_2025_0920_1335': './src/assets/scripts/app_2025_0920_1335.js',        
        //'2025_0920_1337/app_2025_0920_1337': './src/assets/scripts/app_2025_0920_1337.js',        
        //'2025_0927_1157/app_2025_0927_1157': './src/assets/scripts/app_2025_0927_1157.js',        
        //'2025_0927_1201/app_2025_0927_1201': './src/assets/scripts/app_2025_0927_1201.js',           
        //'2025_0927_1246/app_2025_0927_1246': './src/assets/scripts/app_2025_0927_1246.js',        
        //'2025_1005_1106/app_2025_1005_1106': './src/assets/scripts/app_2025_1005_1106.js',        
        //'2025_1005_1107/app_2025_1005_1107': './src/assets/scripts/app_2025_1005_1107.js',        
        //'2025_1005_1108/app_2025_1005_1108': './src/assets/scripts/app_2025_1005_1108.js',        
        //'2025_1005_1116/app_2025_1005_1116': './src/assets/scripts/app_2025_1005_1116.js',        
        //'2025_1005_1204/app_2025_1005_1204': './src/assets/scripts/app_2025_1005_1204.js',        
        //'2025_1012_1142/app_2025_1012_1142': './src/assets/scripts/app_2025_1012_1142.js',        
        //'2025_1012_1211/app_2025_1012_1211': './src/assets/scripts/app_2025_1012_1211.js',        
        //'2025_1012_1215/app_2025_1012_1215': './src/assets/scripts/app_2025_1012_1215.js',        
        //'2025_1012_1216/app_2025_1012_1216': './src/assets/scripts/app_2025_1012_1216.js',        
        //'2025_1018_1200/app_2025_1018_1200': './src/assets/scripts/app_2025_1018_1200.js',        
        //'2025_1018_1218/app_2025_1018_1218': './src/assets/scripts/app_2025_1018_1218.js',        
        //'2025_1018_1235/app_2025_1018_1235': './src/assets/scripts/app_2025_1018_1235.js',        
        //'2025_1018_1236/app_2025_1018_1236': './src/assets/scripts/app_2025_1018_1236.js',        
        //'2025_1018_1254/app_2025_1018_1254': './src/assets/scripts/app_2025_1018_1254.js',        
        //'2025_1018_1317/app_2025_1018_1317': './src/assets/scripts/app_2025_1018_1317.js',        
        //'2025_1018_1322/app_2025_1018_1322': './src/assets/scripts/app_2025_1018_1322.js',        
        //'2025_1018_1323/app_2025_1018_1323': './src/assets/scripts/app_2025_1018_1323.js',        
        //'2025_1018_1324/app_2025_1018_1324': './src/assets/scripts/app_2025_1018_1324.js',        
        //'2025_1101_1129/app_2025_1101_1129': './src/assets/scripts/app_2025_1101_1129.js',        
        //'2025_1101_1139/app_2025_1101_1139': './src/assets/scripts/app_2025_1101_1139.js',        
        //'2025_1101_1152/app_2025_1101_1152': './src/assets/scripts/app_2025_1101_1152.js',        
        //'2025_1101_1154/app_2025_1101_1154': './src/assets/scripts/app_2025_1101_1154.js',        
        //'2025_1101_1156/app_2025_1101_1156': './src/assets/scripts/app_2025_1101_1156.js',        
        //'2025_1101_1232/app_2025_1101_1232': './src/assets/scripts/app_2025_1101_1232.js',        
        //'2025_1115_1213/app_2025_1115_1213': './src/assets/scripts/app_2025_1115_1213.js',        
        //'2025_1115_1214/app_2025_1115_1214': './src/assets/scripts/app_2025_1115_1214.js',        
        //'2025_1115_1241/app_2025_1115_1241': './src/assets/scripts/app_2025_1115_1241.js',        
        //'2025_1122_1155/app_2025_1122_1155': './src/assets/scripts/app_2025_1122_1155.js',        
        '2025_1122_1157/app_2025_1122_1157': './src/assets/scripts/app_2025_1122_1157.js',        
        //'2025_1122_1214/app_2025_1122_1214': './src/assets/scripts/app_2025_1122_1214.js',        
        //'2025_1122_1219/app_2025_1122_1219': './src/assets/scripts/app_2025_1122_1219.js',        
        //'2025_1122_1239/app_2025_1122_1239': './src/assets/scripts/app_2025_1122_1239.js',        
        //'2025_1122_1247/app_2025_1122_1247': './src/assets/scripts/app_2025_1122_1247.js',        
        //'2025_1122_1304/app_2025_1122_1304': './src/assets/scripts/app_2025_1122_1304.js',        
        //'2025_1122_1306/app_2025_1122_1306': './src/assets/scripts/app_2025_1122_1306.js',        
        //'2025_1130_1247/app_2025_1130_1247': './src/assets/scripts/app_2025_1130_1247.js',        
        //'2025_1130_1252/app_2025_1130_1252': './src/assets/scripts/app_2025_1130_1252.js',        
        //'2025_1130_1257/app_2025_1130_1257': './src/assets/scripts/app_2025_1130_1257.js',        
        //'2025_1130_1324/app_2025_1130_1324': './src/assets/scripts/app_2025_1130_1324.js',        
        //'2025_1130_1354/app_2025_1130_1354': './src/assets/scripts/app_2025_1130_1354.js',        
        //'2025_1207_1439/app_2025_1207_1439': './src/assets/scripts/app_2025_1207_1439.js',        
        //'2025_1207_1451/app_2025_1207_1451': './src/assets/scripts/app_2025_1207_1451.js',        
        //'2025_1207_1453/app_2025_1207_1453': './src/assets/scripts/app_2025_1207_1453.js',        
        //'2025_1207_1455/app_2025_1207_1455': './src/assets/scripts/app_2025_1207_1455.js',        
        //'2025_1207_1456/app_2025_1207_1456': './src/assets/scripts/app_2025_1207_1456.js',        
        //'2025_1207_1457/app_2025_1207_1457': './src/assets/scripts/app_2025_1207_1457.js',        
        '2025_1207_1458/app_2025_1207_1458': './src/assets/scripts/app_2025_1207_1458.js',        
                
        
    },
    module: {
        rules: [
            {
                test: [/\.js$/],
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        "modules": false
                                    }
                                ]
                            ],
                        }
                    }
                ]
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: 'css-loader',
                    },
                ]
            },           
            {
                test: [/\.(glsl|vs|fs|vert|frag)$/],
                exclude: /node_modules/,
                use: [
                    'raw-loader', 'glslify-loader'
                ]
            },
            {
                test: [/\.ejs$/],
                use: [
                    'ejs-compiled-loader'
                ]
            }
        ]
    },
    target: 'web',
    plugins: [
        new BrowserSyncPlugin({
            host: process.env.WEBPACK_BROWSER_SYNC_HOST || 'localhost',
            port: process.env.WEBPACK_BROWSER_SYNC_PORT || 3000,
            proxy: process.env.WEBPACK_BROWSER_SYNC_PROXY || false,
            server: process.env.WEBPACK_BROWSER_SYNC_PROXY ? false : distRelativePath,
            open: false,
            files: [distRelativePath],
            injectChanges: true,
        }),
        new StylelintPlugin({ configFile: path.resolve(__dirname, '.stylelintrc.js') }),
        new ESLintPlugin({
            extensions: ['.js'],
            exclude: 'node_modules'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, `${srcRelativePath}/assets/images`),
                    to: path.resolve(__dirname, `${distRelativePath}/images`),
                    noErrorOnMissing: true,
                    transform: {
                        transformer: mode === 'production' ? optimizeImage : content => content
                    }
                }
            ]
        }),
          new HtmlWebpackPlugin({
            inject: false,
            template: path.resolve(__dirname, `${srcRelativePath}/2025_1122_1157.ejs`),
            filename: path.resolve(__dirname, `${distRelativePath}/2025_1122_1157/index.html`),
            minify: {
              collapseWhitespace: true,
              preserveLineBreaks: true,
            },
          }),
                  
        ],
}


if (mode === 'development') {
    config.devtool = 'source-map';
}

module.exports = config;
