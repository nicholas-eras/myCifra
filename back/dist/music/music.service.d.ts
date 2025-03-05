import { PrismaService } from '../prisma/prisma.service';
import { CreateMusicDto, UpdateMusicDto } from './dto/music.dto';
export declare class MusicService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createMusicDto: CreateMusicDto): Promise<{
        name: string;
        artist: string;
        id: number;
    }>;
    findAll(): Promise<{
        name: string;
        artist: string;
        id: number;
    }[]>;
    findOne(id: number): Promise<({
        lyrics: ({
            chords: {
                chord: string;
                id: number;
                lyricId: number;
                width: string;
                marginLeft: string;
            }[];
        } & {
            id: number;
            lineIndex: number;
            text: string;
            musicId: number;
        })[];
    } & {
        name: string;
        artist: string;
        id: number;
    }) | null>;
    update(id: number, newMusicDto: UpdateMusicDto): Promise<{
        name: string;
        artist: string;
        id: number;
    }>;
    remove(id: number): Promise<void>;
    private createLyrics;
}
