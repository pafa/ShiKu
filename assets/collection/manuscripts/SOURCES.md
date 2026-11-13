# 敦煌汉文写本目录

目录文件来自[法国国家图书馆 2026 年 9 月公布的 BnF Archives et manuscrits 开放数据](https://api.bnf.fr/fr/dumps-de-bnf-archives-et-manuscrits)，采用该页所列的法国政府开放许可，署名 Bibliothèque nationale de France，Département des Manuscrits。法国国家图书馆的[中亚和东亚手稿馆藏介绍](https://www.bnf.fr/fr/manuscrits-du-monde-asie-centrale-et-orientale)确认了这一编目系列与敦煌写本的关系。

从手稿部数据中读取 Pelliot chinois 的五个分册（2001–2500、2501–3000、3001–3500、3501–4000、4001–6040），按 XML 中明载的馆藏号筛选单件级记录，再用同批工作表核对档案永久链接。2,808 条编目记录含同号分件、残片与正背面，不以相同数字去重为一件古时的书。各条列出编目原题、文种、纪年和形制（如有），子目、说明与来历存于本站的分卷文件。原机构公布扫描本的条目另附该书卷的 Gallica 链接。

站内中文题名来自档案自身的汉字题名，去除编目为了注音而插在汉字间的空格。无汉字题名者保留编目原题。分类标签供检索使用，按原描述措辞归纳。档案中表示存疑的记号和世纪区间保留。索引和正文没有把书卷归入单一朝代。

复核程序见 scripts/import-bnf.py。数据来源标识为 FRBNFEAD，逐条保留。

此次按照每一份 XML 中的分件层级重新核对数字图像入口。有多个独立分件时，图像跟随对应的馆藏号展出。正面为收养契约的 Pelliot chinois 4525 (12)，采用该分件自己的 Gallica 标识 btv1b83027819。
