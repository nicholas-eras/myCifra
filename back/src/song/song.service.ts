// song.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSongDto, UpdateSongDto } from './dto/song.dto';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class SongService {
  private readonly logger = new Logger(SongService.name);

  constructor(private prisma: PrismaService, private readonly userService: UsersService) {}

  private toArtistSlug(artist: string) {
    return artist.toLowerCase().replace(/\s+/g, '-');
  }

  private getMetadataFromLatestText(
    song: { name: string; artist: string; SongText?: { lyrics: unknown }[] },
  ) {
    const latestText = song.SongText?.[0]?.lyrics as { name?: string; artist?: string } | undefined;

    return {
      name: latestText?.name ?? song.name,
      artist: latestText?.artist ?? song.artist,
    };
  }

  private async syncSongMetadata(
    songId: number,
    name: string,
    artist: string,
  ) {
    return this.prisma.song.update({
      where: { id: songId },
      data: {
        name,
        artist,
        artistSlug: this.toArtistSlug(artist),
      },
    });
  }

  async create(createSongDto: CreateSongDto) {
    const { name, artist, lyrics, createdBy } = createSongDto;
    const artistSlug = artist.toLowerCase().replace(/\s+/g, '-');
    const newSong = await this.prisma.song.create({
      data: {
        name,
        artist,
        createdBy,
        artistSlug
      },
    });
    
    await this.prisma.songText.create({
      data: {
        songId: newSong.id,
        lyrics: JSON.parse(JSON.stringify(createSongDto)),
      },
    });

    // await this.createLyrics(createSongDto as UpdateSongDto, newSong.id);

    return newSong; 
  }

  async findAll(userId: string | null) {
    const songs = await this.prisma.song.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        createdBy: true,
        artist: true,
        SongText: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { lyrics: true },
        },
      },
    });

    let user: User;
    if (userId){
      user = await this.userService.findbyId(userId);
    }
    
    return {
      isAdmin: user! ? user?.isAdmin : false,
      songs :songs.map(song => {
        const metadata = this.getMetadataFromLatestText(song);
        return {
          id: song.id,
          name: metadata.name,
          artist: metadata.artist,
          createdByUser: userId ? song.createdBy === userId || user?.isAdmin : false,
        };
      }),
    };
  }

  async findByArtist(artist: string, userId: string | null) {
    const songs = await this.prisma.song.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        artist: true,
        createdBy: true,
        SongText: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { lyrics: true },
        },
      },
    });

    const normalizedArtist = artist.toLowerCase();
    const filteredSongs = songs.filter((song) => {
      const metadata = this.getMetadataFromLatestText(song);
      return this.toArtistSlug(metadata.artist) === normalizedArtist;
    });

    let user: User | null = null;
    if (userId) {
      user = await this.userService.findbyId(userId);
    }

    return {
      isAdmin: user ? user.isAdmin : true,
      songs: filteredSongs.map((song) => {
        const metadata = this.getMetadataFromLatestText(song);
        return {
          id: song.id,
          name: metadata.name,
          artist: metadata.artist,
          createdByUser: userId
            ? song.createdBy === userId || user?.isAdmin
            : false,
        };
      }),
    };
  }

  async findOne(id: number, userId: string | null) {    
    const song:any = await this.prisma.songText.findFirst({
      where: {
        songId: id,
      },
      include:{
        song: true
      },
      orderBy: {
        createdAt: 'desc', // mais recente
      },
    });

    const song2 = await this.prisma.song.findUnique({
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
 
    if (!song && !song2){
      throw new NotFoundException("Música não encontrada");
    }

    if (!song || !song.lyrics) {
        return song2; // fallback
    }

    let user: User | undefined;
    if (userId){
      user = await this.userService.findbyId(userId);
    }

    return {
      id: song.id,
      songId: song.songId,
      name: song.lyrics.name,
      artist: song.lyrics.artist,
      createdByUser: userId ? song.song.createdBy === userId  || user?.isAdmin : false,
      lyrics: song.lyrics.lyrics ?? [],
    };
  }

  async findAllWithLyrics(userId: string | null) {
    const songs:any = await this.prisma.songText.findMany({      
      include:{
        song: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let user: User;
    if (userId){
      user = await this.userService.findbyId(userId);
    }
    
    return {
      isAdmin: user! ? user?.isAdmin : false,
      songs :songs.map(song => ({
        id: song.id,
        name: song.lyrics.name,
        artist: song.lyrics.artist,
        createdByUser: userId ? song.createdBy === userId || user?.isAdmin : false,
        lyrics: song.lyrics.lyrics,
        songId: song.songId
      })
    )};
  }

  async update(id: number, newSongDto: UpdateSongDto) {
    if (newSongDto.name && newSongDto.artist) {
      await this.syncSongMetadata(id, newSongDto.name, newSongDto.artist);
    }

    const song = await this.prisma.songText.create({
      data: {
        songId: id,
        lyrics: JSON.parse(JSON.stringify(newSongDto)),
      },
    });
    
    return song.lyrics; 
  }

  async remove(id: number){
    const song = await this.prisma.song.delete({
      where:{
        id
      }
    })
  }

  private async createLyrics(newSongDto: UpdateSongDto, songId: number) {
    if (!newSongDto.lyrics) { return }
    
    // 1. Contar quantos acordes esperamos
    const totalExpected = newSongDto.lyrics.reduce((sum, lyric) => sum + lyric.chords.length, 0);
    console.log(`🎯 Esperamos salvar ${totalExpected} acordes`);
    
    // 2. Salvar lista dos acordes que vamos tentar criar
    const expectedChords: string[] = [];
    newSongDto.lyrics.forEach((lyric, i) => {
      lyric.chords.forEach(chord => {
        expectedChords.push(`Linha${i}-${chord.chord}@${chord.position}`);
      });
    });
    console.log('📝 Acordes esperados:', expectedChords);

    // 3. Deletar acordes existentes
    const deletedCount = await this.prisma.chord.deleteMany({
      where: {
        lyric: { songId: songId }
      }
    });
    console.log(`🗑️ Acordes deletados: ${deletedCount.count}`);

    // 4. Processar cada linha
    for (let i = 0; i < newSongDto.lyrics.length; i++) {
      const lyricChords = newSongDto.lyrics[i];
      
      console.log(`📝 Processando linha ${i}: "${lyricChords.text}" com ${lyricChords.chords.length} acordes`);
      
      const lyric = await this.prisma.lyric.upsert({
        where: {
          songId_lineIndex: { songId: songId, lineIndex: i }
        },
        create: {
          lineIndex: i,
          text: lyricChords.text,
          songId: songId
        },
        update: {
          lineIndex: i,
          text: lyricChords.text,
          songId: songId
        }
      });
      
      console.log(`✅ Lyric criada/atualizada com ID: ${lyric.id}`);

      // 5. Processar acordes desta linha
      for (let j = 0; j < lyricChords.chords.length; j++) {
        const chordInfo = lyricChords.chords[j];
        
        console.log(`🎸 Tentando criar acorde ${j + 1}/${lyricChords.chords.length}:`, {
          chord: chordInfo.chord,
          position: chordInfo.position,
          offset: chordInfo.offset,
          width: chordInfo.width
        });
        
        // Converter offset se necessário
        let processedOffset = chordInfo.offset;
        if (typeof chordInfo.offset === 'string') {
          processedOffset = parseFloat((chordInfo.offset as string).replace("px", ""));
          console.log(`🔄 Offset convertido: "${chordInfo.offset}" → ${processedOffset}`);
        }
        
        try {
          const createdChord = await this.prisma.chord.create({
            data: {
              lyricId: lyric.id,
              chord: chordInfo.chord,
              position: chordInfo.position,
              offset: processedOffset,
              width: chordInfo.width
            }
          });
          
          console.log(`✅ Acorde criado com sucesso:`, {
            id: createdChord.id,
            chord: createdChord.chord,
            position: createdChord.position,
            lyricId: createdChord.lyricId
          });
          
        } catch (error) {
          console.error(`❌ ERRO ao criar acorde "${chordInfo.chord}":`, error);
          console.error('❌ Dados que causaram erro:', {
            lyricId: lyric.id,
            chord: chordInfo.chord,
            position: chordInfo.position,
            offset: processedOffset,
            width: chordInfo.width
          });
          // Continue processando os outros acordes mesmo se um der erro
        }
      }
    }

    // 6. Verificação final - ver quais foram realmente salvos
    const savedChords = await this.prisma.chord.findMany({
      where: { lyric: { songId } },
      include: { lyric: { select: { lineIndex: true } } },
      orderBy: [
        { lyric: { lineIndex: 'asc' } },
        { position: 'asc' }
      ]
    });
    
    const actualChords = savedChords.map(c => 
      `Linha${c.lyric.lineIndex}-${c.chord}@${c.position}`
    );
    console.log('💾 Acordes realmente salvos:', actualChords);
    
    // 7. Comparar e mostrar quais sumiram
    const missing = expectedChords.filter(expected => !actualChords.includes(expected));
    if (missing.length > 0) {
      console.error(`❌ ${missing.length} acordes sumiram:`, missing);
    } else {
      console.log('✅ Todos os acordes foram salvos com sucesso!');
    }
    
    console.log(`📊 RESUMO: Esperados: ${totalExpected}, Salvos: ${savedChords.length}, Perdidos: ${missing.length}`);
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
        if (typeof chordInfo.offset == 'string'){
          chordInfo.offset = parseFloat((chordInfo.offset as string).replace("px", ""));
        }
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

    const newSong = await this.syncSongMetadata(songId, name!, artist!);
    
    await this.prisma.songText.create({
      data: {
        songId: songId,
        lyrics: JSON.parse(JSON.stringify(updateSongChords)),
      },
    });
    return newSong; 
  }
}
