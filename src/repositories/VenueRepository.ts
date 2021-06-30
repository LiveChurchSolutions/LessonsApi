import { DB } from "../apiBase/db";
import { Venue } from "../models";
import { UniqueIdHelper } from "../helpers";

export class VenueRepository {

  public save(venue: Venue) {
    return venue.id ? this.update(venue) : this.create(venue);
  }

  private async create(venue: Venue) {
    venue.id = UniqueIdHelper.shortId();
    const sql = "INSERT INTO venues (id, churchId, lessonId, name, sort) VALUES (?, ?, ?, ?, ?);";
    const params = [venue.id, venue.churchId, venue.lessonId, venue.name, venue.sort];
    await DB.query(sql, params);
    return venue;
  }

  private async update(venue: Venue) {
    const sql = "UPDATE venues SET lessonId=?, name=?, sort=? WHERE id=? AND churchId=?";
    const params = [venue.lessonId, venue.name, venue.sort, venue.id, venue.churchId];
    await DB.query(sql, params);
    return venue;
  }

  public loadByLessonId(churchId: string, lessonId: string): Promise<Venue[]> {
    return DB.query("SELECT * FROM venues WHERE churchId=? AND lessonId=? ORDER BY sort", [churchId, lessonId]);
  }

  public loadPublicByLessonId(lessonId: string): Promise<Venue[]> {
    return DB.query("SELECT * FROM venues WHERE lessonId=? ORDER BY sort", [lessonId]);
  }

  public load(churchId: string, id: string): Promise<Venue> {
    return DB.queryOne("SELECT * FROM venues WHERE id=? AND churchId=?", [id, churchId]);
  }

  public loadAll(churchId: string): Promise<Venue[]> {
    return DB.query("SELECT * FROM venues WHERE churchId=? ORDER BY sort", [churchId]);
  }

  public delete(churchId: string, id: string): Promise<Venue> {
    return DB.query("DELETE FROM venues WHERE id=? AND churchId=?", [id, churchId]);
  }

}
