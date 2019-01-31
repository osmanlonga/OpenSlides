import { Component, Input } from '@angular/core';

import { BaseComponent } from '../../../base.component';
import { ViewportService } from '../../../core/ui-services/viewport.service';

/**
 * Component for the motion comments view
 */
@Component({
    selector: 'os-meta-text-block',
    templateUrl: './meta-text-block.component.html',
    styleUrls: ['./meta-text-block.component.scss']
})
export class MetaTextBlockComponent extends BaseComponent {
    @Input()
    public showActionRow: boolean;

    public constructor(public vp: ViewportService) {
        super();
    }
}
