"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MusicService = class MusicService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMusicDto) {
        const { name, artist, lyrics } = createMusicDto;
        const newMusic = await this.prisma.music.create({
            data: {
                name,
                artist,
            },
        });
        if (!lyrics) {
            return newMusic;
        }
        await this.createLyrics(createMusicDto, newMusic.id);
        return newMusic;
    }
    async findAll() {
        const music = await this.prisma.music.findMany();
        return music;
    }
    async findOne(id) {
        const music = await this.prisma.music.findUnique({
            where: {
                id
            },
            include: {
                lyrics: {
                    include: {
                        chords: true
                    },
                    orderBy: {
                        lineIndex: 'asc'
                    }
                }
            }
        });
        return music;
    }
    async update(id, newMusicDto) {
        const music = await this.prisma.music.update({
            where: {
                id
            },
            data: {
                artist: newMusicDto.artist,
                name: newMusicDto.name
            }
        });
        await this.createLyrics(newMusicDto, id);
        return music;
    }
    async remove(id) {
        const music = await this.prisma.music.delete({
            where: {
                id
            }
        });
    }
    async createLyrics(newMusicDto, musicId) {
        newMusicDto.lyrics.forEach(async (lyricChords, i) => {
            const lyric = await this.prisma.lyric.upsert({
                where: {
                    musicId_lineIndex: {
                        musicId: musicId,
                        lineIndex: i,
                    },
                },
                create: {
                    lineIndex: i,
                    text: lyricChords.text,
                    musicId: musicId
                },
                update: {
                    lineIndex: i,
                    text: lyricChords.text,
                    musicId: musicId
                }
            });
            lyricChords.chords.forEach(async (chordInfo) => {
                await this.prisma.chord.deleteMany({
                    where: {
                        lyric: {
                            musicId: musicId
                        }
                    }
                });
                await this.prisma.chord.create({
                    data: {
                        lyricId: lyric.id,
                        chord: chordInfo.chord,
                        width: chordInfo.width,
                        marginLeft: chordInfo.marginLeft
                    }
                });
            });
        });
    }
};
exports.MusicService = MusicService;
exports.MusicService = MusicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MusicService);
//# sourceMappingURL=music.service.js.map