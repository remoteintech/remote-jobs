import assert from 'node:assert/strict';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Eleventy from '@11ty/eleventy';
import {
  getAllCompanies,
  getCompaniesByRegion,
  getCompaniesByTech,
  getCompanyTags
} from '../src/_config/collections.js';

test('company collections reflect added and removed profiles on rebuild', async () => {
  const originalDirectory = process.cwd();
  const directory = await mkdtemp(path.join(tmpdir(), 'remote-in-tech-collections-'));

  try {
    process.chdir(directory);
    await mkdir('src/companies', {recursive: true});
    const profile = title => `---\ntitle: ${title}\nregion: europe\ntechnologies: [javascript]\n---\n`;
    await writeFile('src/companies/first.md', profile('First'));
    await writeFile(
      'src/index.njk',
      '{% for company in collections.companies %}{{ company.data.title }};{% endfor %}' +
        '|{{ collections.companiesByRegion.europe.length }}' +
        '|{{ collections.companiesByTech.javascript.length }}' +
        '{% for tag in collections.companyTags %}|{{ tag.slug }}:{{ tag.count }}{% endfor %}'
    );

    const render = async () => {
      const eleventy = new Eleventy('src', 'dist', {
        configPath: false,
        config: config => {
          config.addCollection('companies', getAllCompanies);
          config.addCollection('companiesByRegion', getCompaniesByRegion);
          config.addCollection('companiesByTech', getCompaniesByTech);
          config.addCollection('companyTags', getCompanyTags);
        }
      });
      const pages = await eleventy.toJSON();
      return pages.find(page => page.url === '/').content;
    };

    assert.equal(await render(), 'First;|1|1|javascript:1|europe:1');

    await writeFile('src/companies/second.md', profile('Second'));
    assert.equal(await render(), 'First;Second;|2|2|javascript:2|europe:2');

    await rm('src/companies/first.md');
    assert.equal(await render(), 'Second;|1|1|javascript:1|europe:1');
  } finally {
    process.chdir(originalDirectory);
    await rm(directory, {recursive: true, force: true});
  }
});
