import fixtures from '../fixtures/denali';
import { forEach } from 'lodash';

export default function(server) {

  server.createList('addon', 20);
  
  forEach(fixtures.versions, (versionData, semver) => {
    let version = server.create('version', {
      id: semver,
      semver,
      name: versionData.name,
      channel: versionData.channel,
      publishedAt: versionData.publishedAt
    });
    
    forEach(versionData.pages.guides, (guideData) => {
      server.create('guide', {
        title: guideData.title,
        body: guideData.body,
        group: guideData.group,
        order: guideData.order,
        version
      });
    });

    let api = server.create('api', {
      version
    });
    forEach(versionData.api.packages, (pkg, pkgName) => {
      forEach(pkg.classes, (klass) => {
        server.create('api-class', Object.assign({
          pkg: pkgName,
          _versionId: version.id,
          api    
        }, klass));
      });
      forEach(pkg.functions, (klass) => {
        server.create('api-function', Object.assign({
          pkg: pkgName,
          _versionId: version.id,
          api    
        }, klass));
      });
      forEach(pkg.interfaces, (klass) => {
        server.create('api-interface', Object.assign({
          pkg: pkgName,
          _versionId: version.id,
          api    
        }, klass));
      });
    });
  });

}
