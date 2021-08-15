import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlaygroundRoutingModule } from './playground-routing.module';
import { PanelComponent } from './containers/panel/panel.component';
import { MapComponent } from './containers/map/map.component';

@NgModule({
  declarations: [PanelComponent, MapComponent],
  imports: [CommonModule, PlaygroundRoutingModule],
})
export class PlaygroundModule {}
