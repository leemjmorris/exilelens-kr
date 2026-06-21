import { join } from 'node:path';

export interface ClientLogDiscoveryResult {
  clientLogPath: string;
  candidates: string[];
}

export function buildClientLogPathCandidates(documentsPath: string): string[] {
  return [
    join(documentsPath, 'My Games', 'Path of Exile 2', 'logs', 'KakaoClient.txt'),
    join(documentsPath, 'My Games', 'Path of Exile 2', 'logs', 'Client.txt'),
    join(documentsPath, 'My Games', 'Path of Exile 2', 'KakaoClient.txt'),
    join(documentsPath, 'My Games', 'Path of Exile 2', 'Client.txt'),
    join('C:\\Kakaogames', 'Path of Exile2', 'logs', 'KakaoClient.txt'),
    join('C:\\Kakaogames', 'Path of Exile2', 'logs', 'Client.txt'),
    join('C:\\Kakaogames', 'Path of Exile2', 'logs', 'LatestClient.txt'),
    join('C:\\Kakaogames', 'Path of Exile 2', 'logs', 'KakaoClient.txt'),
    join('C:\\Kakaogames', 'Path of Exile 2', 'logs', 'Client.txt'),
    join('C:\\Daum Games', 'Path of Exile2', 'logs', 'KakaoClient.txt'),
    join('C:\\Daum Games', 'Path of Exile2', 'logs', 'Client.txt'),
    join('C:\\Daum Games', 'Path of Exile 2', 'logs', 'KakaoClient.txt'),
    join('C:\\Daum Games', 'Path of Exile 2', 'logs', 'Client.txt'),
    join('C:\\Program Files (x86)', 'Grinding Gear Games', 'Path of Exile 2', 'logs', 'Client.txt'),
    join('C:\\Program Files (x86)', 'Steam', 'steamapps', 'common', 'Path of Exile 2', 'logs', 'Client.txt'),
    join('C:\\Program Files', 'Epic Games', 'PathOfExile2', 'logs', 'Client.txt')
  ];
}
