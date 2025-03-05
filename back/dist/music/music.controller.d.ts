import { MusicService } from './music.service';
import { CreateMusicDto, UpdateMusicDto } from './dto/music.dto';
export declare class MusicController {
    private readonly musicService;
    constructor(musicService: MusicService);
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
    findOne(id: string): Promise<({
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
    update(id: string, updateMusicDto: UpdateMusicDto): Promise<{
        name: string;
        artist: string;
        id: number;
    }>;
    remove(id: string): Promise<void>;
}
