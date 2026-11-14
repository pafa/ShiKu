import assert from 'node:assert/strict';

// Run against the temporary room used by the release browser checks.
export async function checkVisitInteractions(browser,base){
  async function enter(page,query){
    await page.goto(new URL(query,base).href);
    await page.locator('#open-registration').click();
    await page.locator('#guest-name').fill('展品验收');
    await page.locator('#join-room').click();
    await page.waitForFunction(()=>!document.querySelector('#museum').inert && document.querySelector('#visit-cover').hidden);
  }
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  try{
    const page=await context.newPage(),errors=[];
    page.setDefaultTimeout(45000);
    page.on('pageerror',err=>errors.push(err.message));
    const title=page.locator('#ex-title'),photo=page.locator('#artifact:visible'),zoom=page.locator('.enlarge');
    await enter(page,'?work=mogao-420&private=omit');
    await photo.waitFor();
    const first=await title.innerText(),next=page.locator('[data-action=next]');
    // Learn the image URL from the exhibition record. It may change with new rights-cleared photography.
    const photoPath=await page.evaluate(async()=>{
      const {halls}=await import('./dynasty-exhibition.js'),{workForDisplay}=await import('./authentic-display.js');
      const hall=halls.find(h=>h.scenes.some(s=>s.id==='mogao-420'&&!s.crossPeriod));
      return new URL(workForDisplay(hall.scenes[hall.scenes.findIndex(s=>s.id==='mogao-420')+1]).visual.src,location.href).href;
    });
    await page.route(photoPath,route=>route.abort('failed'));
    await next.click();
    await page.locator('.plate-retry').waitFor();
    assert(await zoom.isDisabled());
    const second=await title.innerText(),place=new URL(page.url()).search;
    assert.notEqual(second,first);
    assert.deepEqual([...new URLSearchParams(place).keys()],['work']);
    await page.unroute(photoPath);
    await page.locator('.plate-retry').click();
    await photo.waitFor();assert(await zoom.isEnabled());
    await page.goBack();assert.equal(await title.innerText(),first);
    await page.goForward();assert.equal(await title.innerText(),second);
    await page.locator('[data-action=person]').click();
    await page.getByRole('button',{name:'分享这一站'}).click();
    assert.equal(new URL(await page.getByRole('textbox',{name:'本站地址'}).inputValue()).search,place);
    await page.keyboard.press('Escape');
    // Closing a study goes back to the originating work once, with no duplicate stop.
    await page.locator('[data-action=structure]').click();
    await page.locator('#detail[open]').waitFor();
    await page.keyboard.press('Escape');
    await page.waitForURL(url=>url.search===place);
    await page.goBack();
    assert.equal(await title.innerText(),first);
    await page.goForward();
    assert.equal(await title.innerText(),second);

    // A catalogue result keeps its originating filter, page and text on Back.
    await page.locator('[data-action=collection]').click();
    await page.getByLabel('按遗址筛选').selectOption('mogao');
    const search=page.getByRole('searchbox');
    await search.fill('莫高');
    await page.getByRole('button',{name:'下一页 →'}).click();
    const listAddress=page.url();
    assert.equal(new URL(listAddress).searchParams.get('site'),'mogao');
    assert.equal(new URL(listAddress).searchParams.get('page'),'2');
    assert(!new URL(listAddress).searchParams.has('q'));
    const card=page.locator('.desk-results.art-grid .catalog-result').first();
    const item=await card.locator('strong').innerText();
    await card.click();
    await page.goBack();await page.waitForURL(listAddress);
    assert.equal(await search.inputValue(),'莫高');
    assert.equal(await card.locator('strong').innerText(),item);
    await page.keyboard.press('Escape');await page.waitForURL(url=>url.search===place);
    await page.locator('[data-action=person]').click();
    await page.getByRole('button',{name:'离馆',exact:true}).click();
    await page.locator('#open-registration').waitFor();
    await page.setViewportSize({width:320,height:568});
    await enter(page,'?experience=mogao-158');
    await page.locator('#walk-companion').waitFor();
    for(const [width,height] of [[320,568],[390,844],[844,390]]){
      await page.setViewportSize({width,height});
      await page.waitForFunction(expected=>{
        const pins=[...document.querySelectorAll('.cave-pin:not([hidden])')];
        return innerWidth===expected && document.documentElement.scrollWidth===expected && pins.length>0 && pins.every(b=>{
          const rect=b.getBoundingClientRect();
          return b===document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2)?.closest('button');
        });
      },width);
    }
    // Touch a projected stop, travel or jump there, and verify it can be reopened by URL.
    await page.setViewportSize({width:320,height:568});
    await page.locator('.cave-pin').filter({hasText:'02'}).click();
    await page.locator('#cave-trip-direct').click();
    await page.waitForFunction(()=>new URLSearchParams(location.search).get('detail')==='cheek');
    assert.equal(await page.locator('#stroll-title').innerText(),'佛首倚着叠枕');
    await page.locator('[data-action=person]').click();
    await page.getByRole('button',{name:'离馆',exact:true}).click();
    await page.locator('#open-registration').waitFor();
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
}
