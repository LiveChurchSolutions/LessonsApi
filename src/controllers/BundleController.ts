import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { LessonsBaseController } from "./LessonsBaseController"
import { Bundle, Resource, Asset, Variant, File } from "../models"
import { Permissions } from '../helpers/Permissions'
import { FilesHelper } from "../helpers";
import { ArrayHelper } from "../apiBase";


@controller("/bundles")
export class BundleController extends LessonsBaseController {

  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.lessons.edit)) return this.json({}, 401);
      else return await this.repositories.bundle.load(au.churchId, id)
    });
  }

  @httpGet("/content/:contentType/:contentId")
  public async getForContent(@requestParam("contentType") contentType: string, @requestParam("contentId") contentId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.lessons.edit)) return this.json({}, 401);
      else return await this.repositories.bundle.loadByContentTypeId(au.churchId, contentType, contentId);
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Bundle[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.lessons.edit)) return this.json({}, 401);
      else {
        const promises: Promise<Bundle>[] = [];
        req.body.forEach(bundle => { bundle.churchId = au.churchId; promises.push(this.repositories.bundle.save(bundle)); });
        const result = await Promise.all(promises);
        return result;
      }
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(Permissions.lessons.edit)) return this.json({}, 401);
      else {
        const resources: Resource[] = await this.repositories.resource.loadByBundleId(au.churchId, id);
        for (let r of resources) await this.deleteResource(r.churchId, r.id);
        await FilesHelper.deleteBundleFolder(au.churchId, id);
        await this.repositories.bundle.delete(au.churchId, id);
      }
    });
  }

  private async deleteResource(churchId: string, resourceId: string) {
    const promises: Promise<any>[] = [];
    promises.push(this.repositories.asset.loadByResourceId(churchId, resourceId).then(assets =>
      assets.forEach(async a => {
        await FilesHelper.deleteFile(churchId, a.fileId, a.resourceId);
        await this.repositories.asset.delete(churchId, a.id);
      })
    ));
    promises.push(this.repositories.variant.loadByResourceId(churchId, resourceId).then(variants =>
      variants.forEach(async v => {
        await FilesHelper.deleteFile(churchId, v.fileId, v.resourceId);
        await this.repositories.variant.delete(churchId, v.id);
      })
    ));

    await Promise.all(promises);
    await FilesHelper.deleteResourceFolder(churchId, resourceId);
    await this.repositories.resource.delete(churchId, resourceId);

  }


}
