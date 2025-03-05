// music.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMusicDto, UpdateMusicDto } from './dto/music.dto';

@Injectable()
export class MusicService {
  constructor(private prisma: PrismaService) {}

  async create(createMusicDto: CreateMusicDto) {
    const { name, artist, lyrics } = createMusicDto;

    const newMusic = await this.prisma.music.create({
      data: {
        name,
        artist,
      },
    });
    if (!lyrics){
      return newMusic;
    }

    await this.createLyrics(createMusicDto as UpdateMusicDto, newMusic.id);

    return newMusic; 
  }

  async findAll() {    
    const music = await this.prisma.music.findMany();
    return music; 
  }

  async findOne(id: number) {    
    const music = await this.prisma.music.findUnique({
      where:{
        id
      },
      include:{
        lyrics:{
          include:{
            chords:true            
          },
          orderBy:{
            lineIndex: 'asc'
          }
        }        
      }
    });
    return music; 
  }

  async update(id: number, newMusicDto: UpdateMusicDto) {    
    const music = await this.prisma.music.update({
      where:{
        id
      },
      data:{
        artist: newMusicDto.artist,
        name: newMusicDto.name
      }
    });

    await this.createLyrics(newMusicDto, id);

    return music; 
  }

  async remove(id: number){
    const music = await this.prisma.music.delete({
      where:{
        id
      }
    })
  }

  private async createLyrics(newMusicDto: UpdateMusicDto, musicId:number){
    newMusicDto.lyrics.forEach(async(lyricChords, i) => {
      const lyric = await this.prisma.lyric.upsert({
        where:{
          musicId_lineIndex: {
            musicId: musicId,
            lineIndex: i,
          },
        },
        create:{
          lineIndex:i,
          text:lyricChords.text,
          musicId:musicId
        },
        update:{
          lineIndex:i,
          text:lyricChords.text,
          musicId:musicId
        }
      });
      lyricChords.chords.forEach(async(chordInfo) => {
        await this.prisma.chord.deleteMany({
          where:{
            lyric: {
              musicId: musicId
            }
          }
        });
        await this.prisma.chord.create({
          data:{
            lyricId: lyric.id,
            chord: chordInfo.chord,
            width: chordInfo.width,
            marginLeft: chordInfo.marginLeft
          }
        });
      });
    });
  }
}
