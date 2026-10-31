import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {createComponentPreview} from './component-preview.ts';
import {verifiedPreviewFragmentHtml} from './preview-widget.ts';

const assets=JSON.parse(await readFile(new URL('../data/component-previews/solid/torch-ui/assets.json',import.meta.url),'utf8'));
const provenance=JSON.parse(await readFile(new URL('../data/solid-libraries/torch-ui/media.json',import.meta.url),'utf8'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

test('TorchUI discloses the verified photo and replacement film frame',()=>{
  for(const [id,key] of [['torch-ui/Image','photo'],['torch-ui/Video','poster']]){
    const url=assets.components[id].assets[0],asset=assets.assets[url],record=provenance[key],source=key==='poster'?provenance.video.original:record,bytes=Buffer.from(asset.base64,'base64');
    assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');
    assert.equal(asset.mediaType,'image/webp');assert.equal(bytes.length,asset.bytes);assert.equal(digest(bytes),asset.sha256);
    assert.equal(asset.original.sha256,source.sha256);assert.equal(asset.original.bytes,source.bytes);
    assert.equal(asset.sha256,record.delivered.sha256);assert.equal(asset.bytes,record.delivered.bytes);
    assert.equal(asset.transformation,record.transformation);
    if(key==='photo'){assert.equal(asset.original.width,record.delivered.width);assert.equal(asset.original.height,record.delivered.height)}
    const preview=createComponentPreview({id},'https://torch-ui.dev/');assert.equal(preview.available,true);
    const text=new JSDOM(verifiedPreviewFragmentHtml(preview)).window.document.body.textContent;assert.ok(text.includes(asset.original.sha256));assert.ok(text.includes(asset.sha256));assert.ok(text.includes(asset.transformation));
    if(id==='torch-ui/Video')assert.ok(text.includes('© Blender Foundation | cloud.blender.org/spring'));
  }
  const poster=assets.assets[assets.components['torch-ui/Video'].assets[0]];
  assert.match(poster.attribution.license,/CC BY 4\.0/);
  assert.match(poster.transformation,/replaces the documented poster/);
});

test('TorchUI discloses unavailable portraits and retains the library fallback',()=>{
  for(const [id,url,description] of [['torch-ui/Skeleton','/avatar.jpg','/avatar.jpg'],['torch-ui/User Card','/images/headshots/lyra_swiftfoot.jpg','Lyra portrait']]){
    const preview=createComponentPreview({id},'https://torch-ui.dev/');assert.equal(preview.available,true);
    assert.ok(preview.gaps.some(gap=>gap.includes(description)&&gap.includes('initials fallback')));
    assert.ok(!preview.code.includes(url));
    assert.ok(verifiedPreviewFragmentHtml(preview).includes('initials fallback'));
  }
});
