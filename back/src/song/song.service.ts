// song.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSongDto, UpdateSongDto } from './dto/song.dto';

@Injectable()
export class SongService {
  constructor(private prisma: PrismaService) {}

  async create(createSongDto: CreateSongDto) {
    const { name, artist, lyrics } = createSongDto;

    const newSong = await this.prisma.song.create({
      data: {
        name,
        artist,
      },
    });
    
    if (!lyrics){
      return newSong;
    }

    await this.createLyrics(createSongDto as UpdateSongDto, newSong.id);

    return newSong; 
  }

  async findAll() {    
    const song = await this.prisma.song.findMany({
      orderBy:{
        name: "asc"
      }
    });
    return song; 
  }

  async findOne(id: number) {    
    const song = await this.prisma.song.findUnique({
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
    return song; 
  }

  async update(id: number, newSongDto: UpdateSongDto) {    
    const song = await this.prisma.song.update({
      where:{
        id
      },
      data:{
        artist: newSongDto.artist,
        name: newSongDto.name
      }
    });

    await this.createLyrics(newSongDto, id);

    return song; 
  }

  async remove(id: number){
    const song = await this.prisma.song.delete({
      where:{
        id
      }
    })
  }

  private async createLyrics(newSongDto: UpdateSongDto, songId:number){
    if (!newSongDto.lyrics){ return };    

    newSongDto.lyrics.forEach(async(lyricChords, i) => {
      const lyric = await this.prisma.lyric.upsert({
        where:{
          songId_lineIndex: {
            songId: songId,
            lineIndex: i,
          },
        },
        create:{
          lineIndex:i,
          text:lyricChords.text,
          songId:songId
        },
        update:{
          lineIndex:i,
          text:lyricChords.text,
          songId:songId
        }
      });
      lyricChords.chords.forEach(async(chordInfo) => {
        await this.prisma.chord.deleteMany({
          where:{
            lyric: {
              songId: songId
            }
          }
        });
        await this.prisma.chord.create({
          data:{
            lyricId: lyric.id,
            chord: chordInfo.chord,
            position: chordInfo.position,
            offset: chordInfo.offset,
            width: chordInfo.width
          }
        });
      });
    });
  }

  private async updateLyrics(newSongDto: UpdateSongDto, songId:number){
    if (!newSongDto.lyrics){ return };    
    await this.prisma.chord.deleteMany({
      where:{
        lyric: {
          songId: songId
        }
      }
    });

    newSongDto.lyrics.forEach(async(lyricChords, i) => {
      const lyric = await this.prisma.lyric.upsert({
        where:{
          songId_lineIndex: {
            songId: songId,
            lineIndex: i,
          },
        },
        create:{
          lineIndex:i,
          text:lyricChords.text,
          songId:songId
        },
        update:{
          lineIndex:i,
          text:lyricChords.text,
          songId:songId
        }
      });   
      lyricChords.chords.forEach(async(chordInfo) => {
        await this.prisma.chord.create({
          data:{
            lyricId: lyric.id,
            chord: chordInfo.chord,
            position: chordInfo.position,
            offset: chordInfo.offset,
            width: chordInfo.width
          }
        });
      });
    });
  }

  async updateChords(songId: number, updateSongChords: UpdateSongDto) {
    const { name, artist, lyrics } = updateSongChords;

    const newSong = await this.prisma.song.update({
      where:{
        id: songId
      },
      data: {
        name,
        artist,
      },
    });
    
    if (!lyrics){
      return newSong;
    }

    await this.updateLyrics(updateSongChords as UpdateSongDto, newSong.id);

    return newSong; 
  }
}
